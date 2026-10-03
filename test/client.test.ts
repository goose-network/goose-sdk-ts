import { describe, expect, it } from "vitest";
import { Goose } from "../src/goose.js";
import { GooseApiError } from "../src/client.js";
import { GooseClient } from "../src/client.js";
import type { GooseClientOptions } from "../src/client.js";

// A tiny scripted fetch: requests are matched against a handler table and
// served from fixtures. This exercises the SDK's transport without a live
// goose engine. A handler is either a body (status defaults to 200) or a
// [status, body] pair; a bare number means "no body" (204/404...).
function makeFetch(
  handlers: Record<string, [number, unknown] | number | unknown>,
) {
  return (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    const method = init?.method ?? "GET";
    const key = `${method} ${url.replace("http://goose.test", "")}`;
    const h = handlers[key];
    if (h === undefined) {
      return new Response(JSON.stringify({ error: "not found" }), { status: 404 });
    }
    let status = 200;
    let body: unknown = h;
    if (typeof h === "number") {
      status = h;
      body = undefined;
    } else if (Array.isArray(h)) {
      [status, body] = h;
    }
    return new Response(body === undefined ? null : JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;
}

function newGoose(handlers: Record<string, unknown>) {
  return new Goose(
    new GooseClient({
      baseUrl: "http://goose.test",
      token: "s3cret",
      fetch: makeFetch(handlers),
    } satisfies GooseClientOptions),
  );
}

describe("Goose SDK", () => {
  it("sends bearer auth on requests", async () => {
    let sawAuth = "";
    const fetcher = (async (_input: RequestInfo | URL, init?: RequestInit) => {
      sawAuth = (init?.headers as Record<string, string>).Authorization ?? "";
      return new Response(JSON.stringify({ stack: "system" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }) as typeof fetch;
    const goose = new Goose(new GooseClient({ baseUrl: "http://goose.test", token: "s3cret", fetch: fetcher }));
    await goose.getEngine();
    expect(sawAuth).toBe("Bearer s3cret");
  });

  it("lists inbounds", async () => {
    const goose = newGoose({
      "GET /api/inbounds": [
        200,
        [{ id: "in-1", protocol: "http", listen: "127.0.0.1:8080" }],
      ],
    });
    const inbounds = await goose.listInbounds();
    expect(inbounds[0]?.id).toBe("in-1");
    expect(inbounds[0]?.protocol).toBe("http");
  });

  it("creates an outbound via POST with a JSON body", async () => {
    let body: unknown;
    const fetcher = (async (_input: RequestInfo | URL, init?: RequestInit) => {
      body = init?.body ? JSON.parse(String(init.body)) : null;
      return new Response(JSON.stringify(body), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    }) as typeof fetch;
    const goose = new Goose(new GooseClient({ baseUrl: "http://goose.test", fetch: fetcher }));
    const created = await goose.createOutbound({
      id: "ob-1",
      protocol: "http",
      config: { url: "http://proxy.example:3128" },
    });
    expect(created.id).toBe("ob-1");
    expect(body).toEqual({
      id: "ob-1",
      protocol: "http",
      config: { url: "http://proxy.example:3128" },
    });
  });

  it("deletes an inbound and reports 404 as false", async () => {
    const goose = newGoose({
      "DELETE /api/inbounds/gone": 204,
    });
    expect(await goose.deleteInbound("gone")).toBe(true);
    expect(await goose.deleteInbound("ghost")).toBe(false);
  });

  it("creates, lists and deletes a provider spec", async () => {
    const goose = newGoose({
      "POST /api/providers": [
        201,
        {
          id: "sub-1",
          provider: "subscription",
          pool_id: "pool-sub",
          config: { url: "https://example.com/sub" },
        },
      ],
      "GET /api/providers": [
        200,
        [
          {
            id: "sub-1",
            provider: "subscription",
            pool_id: "pool-sub",
            config: { url: "https://example.com/sub" },
          },
        ],
      ],
      "GET /api/providers/sub-1": [
        200,
        {
          id: "sub-1",
          provider: "subscription",
          pool_id: "pool-sub",
          config: { url: "https://example.com/sub" },
        },
      ],
      "DELETE /api/providers/sub-1": 204,
    });
    const created = await goose.createProvider({
      id: "sub-1",
      provider: "subscription",
      pool_id: "pool-sub",
      config: { url: "https://example.com/sub" },
    });
    expect(created.id).toBe("sub-1");
    const list = await goose.listProviders();
    expect(list[0]?.pool_id).toBe("pool-sub");
    const one = await goose.getProvider("sub-1");
    expect(one.config?.url).toBe("https://example.com/sub");
    expect(await goose.deleteProvider("sub-1")).toBe(true);
  });

  it("normalizes error bodies into GooseApiError", async () => {
    const goose = newGoose({
      "PUT /api/engine": [400, { error: "engine: stack must be one of system, gvisor" }],
    });
    const err = await goose
      .setEngine({ stack: "bogus" } as never)
      .catch((e: unknown) => e);
    expect(err).toBeInstanceOf(GooseApiError);
    const apiErr = err as GooseApiError;
    expect(apiErr.status).toBe(400);
    expect(apiErr.message).toContain("stack must be one of");
  });

  it("lists metrics with the n query parameter", async () => {
    let sawPath = "";
    const fetcher = (async (input: RequestInfo | URL) => {
      sawPath = String(input).replace("http://goose.test", "");
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }) as typeof fetch;
    const goose = new Goose(new GooseClient({ baseUrl: "http://goose.test", fetch: fetcher }));
    await goose.listMetrics(42);
    expect(sawPath).toBe("/api/metrics?n=42");
    await goose.listMetrics();
    expect(sawPath).toBe("/api/metrics");
  });
});
