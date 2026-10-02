// src/client.ts — a small fetch-based client for the goose admin API.
//
// The endpoint shapes (paths, parameters, request bodies, response schemas)
// come from the generated schema.ts; this file only wires up transport:
// base URL, bearer-token auth, JSON encode/decode, and error normalization.
/** Error thrown for non-2xx responses. */
export class GooseApiError extends Error {
    status;
    body;
    constructor(status, body, message) {
        super(message);
        this.name = "GooseApiError";
        this.status = status;
        this.body = body;
    }
}
export class GooseClient {
    baseUrl;
    token;
    doFetch;
    constructor(opts) {
        this.baseUrl = opts.baseUrl.replace(/\/+$/, "");
        this.token = opts.token;
        // Bind to globalThis: calling a bare `fetch` reference with `this` rebound
        // to the client throws "Illegal invocation" in browsers.
        this.doFetch = opts.fetch ?? fetch.bind(globalThis);
    }
    /** GET an endpoint and decode the JSON body. */
    async get(path) {
        const res = await this.doFetch(this.url(path), {
            method: "GET",
            headers: this.headers(),
        });
        return this.decode(res);
    }
    /** Send a JSON body with POST/PUT to an endpoint and decode the response. */
    async send(method, path, body) {
        const res = await this.doFetch(this.url(path), {
            method,
            headers: this.headers(),
            body: JSON.stringify(body),
        });
        return this.decode(res);
    }
    /** DELETE an endpoint; resolves with whether the resource existed (204 vs 404). */
    async delete(path) {
        const res = await this.doFetch(this.url(path), {
            method: "DELETE",
            headers: this.headers(),
        });
        if (res.status === 204)
            return true;
        if (res.status === 404)
            return false;
        throw await errorFrom(res);
    }
    url(path) {
        return this.baseUrl + path;
    }
    headers() {
        const h = {
            Accept: "application/json",
        };
        if (this.token !== undefined) {
            h.Authorization = `Bearer ${this.token}`;
        }
        return h;
    }
    async decode(res) {
        if (!res.ok) {
            throw await errorFrom(res);
        }
        if (res.status === 204)
            return undefined;
        const text = await res.text();
        return (text === "" ? undefined : JSON.parse(text));
    }
}
async function errorFrom(res) {
    let body;
    const text = await res.text().catch(() => "");
    if (text !== "") {
        try {
            body = JSON.parse(text);
        }
        catch {
            body = text;
        }
    }
    const message = typeof body === "object" && body !== null && "error" in body
        ? String(body.error)
        : `goose API: ${res.status} ${res.statusText}`;
    return new GooseApiError(res.status, body, message);
}
//# sourceMappingURL=client.js.map