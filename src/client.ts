// src/client.ts — a small fetch-based client for the goose admin API.
//
// The endpoint shapes (paths, parameters, request bodies, response schemas)
// come from the generated schema.ts; this file only wires up transport:
// base URL, bearer-token auth, JSON encode/decode, and error normalization.

export interface GooseClientOptions {
  /** Base URL of the goose engine, e.g. "http://127.0.0.1:9090". */
  baseUrl: string;
  /** Bearer token for the admin API; omit when the engine runs without auth. */
  token?: string;
  /** Custom fetch implementation (Node 18+ has a global one). */
  fetch?: typeof fetch;
}

/** Error thrown for non-2xx responses. */
export class GooseApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, body: unknown, message: string) {
    super(message);
    this.name = "GooseApiError";
    this.status = status;
    this.body = body;
  }
}

export class GooseClient {
  private readonly baseUrl: string;
  private readonly token: string | undefined;
  private readonly doFetch: typeof fetch;

  constructor(opts: GooseClientOptions) {
    this.baseUrl = opts.baseUrl.replace(/\/+$/, "");
    this.token = opts.token;
    // Bind to globalThis: calling a bare `fetch` reference with `this` rebound
    // to the client throws "Illegal invocation" in browsers.
    this.doFetch = opts.fetch ?? fetch.bind(globalThis);
  }

  /** GET an endpoint and decode the JSON body. */
  async get<T>(path: string): Promise<T> {
    const res = await this.doFetch(this.url(path), {
      method: "GET",
      headers: this.headers(),
    });
    return this.decode<T>(res);
  }

  /** Send a JSON body with POST/PUT to an endpoint and decode the response. */
  async send<T>(
    method: "POST" | "PUT",
    path: string,
    body: unknown,
  ): Promise<T> {
    const res = await this.doFetch(this.url(path), {
      method,
      headers: this.headers(),
      body: JSON.stringify(body),
    });
    return this.decode<T>(res);
  }

  /** DELETE an endpoint; resolves with whether the resource existed (204 vs 404). */
  async delete(path: string): Promise<boolean> {
    const res = await this.doFetch(this.url(path), {
      method: "DELETE",
      headers: this.headers(),
    });
    if (res.status === 204) return true;
    if (res.status === 404) return false;
    throw await errorFrom(res);
  }

  private url(path: string): string {
    return this.baseUrl + path;
  }

  private headers(): Record<string, string> {
    const h: Record<string, string> = {
      Accept: "application/json",
    };
    if (this.token !== undefined) {
      h.Authorization = `Bearer ${this.token}`;
    }
    return h;
  }

  private async decode<T>(res: Response): Promise<T> {
    if (!res.ok) {
      throw await errorFrom(res);
    }
    if (res.status === 204) return undefined as T;
    const text = await res.text();
    return (text === "" ? undefined : JSON.parse(text)) as T;
  }
}

async function errorFrom(res: Response): Promise<GooseApiError> {
  let body: unknown;
  const text = await res.text().catch(() => "");
  if (text !== "") {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }
  const message =
    typeof body === "object" && body !== null && "error" in body
      ? String((body as { error: unknown }).error)
      : `goose API: ${res.status} ${res.statusText}`;
  return new GooseApiError(res.status, body, message);
}
