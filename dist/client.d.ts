export interface GooseClientOptions {
    /** Base URL of the goose engine, e.g. "http://127.0.0.1:9090". */
    baseUrl: string;
    /** Bearer token for the admin API; omit when the engine runs without auth. */
    token?: string;
    /** Custom fetch implementation (Node 18+ has a global one). */
    fetch?: typeof fetch;
}
/** Error thrown for non-2xx responses. */
export declare class GooseApiError extends Error {
    readonly status: number;
    readonly body: unknown;
    constructor(status: number, body: unknown, message: string);
}
export declare class GooseClient {
    private readonly baseUrl;
    private readonly token;
    private readonly doFetch;
    constructor(opts: GooseClientOptions);
    /** GET an endpoint and decode the JSON body. */
    get<T>(path: string): Promise<T>;
    /** Send a JSON body with POST/PUT to an endpoint and decode the response. */
    send<T>(method: "POST" | "PUT", path: string, body: unknown): Promise<T>;
    /** DELETE an endpoint; resolves with whether the resource existed (204 vs 404). */
    delete(path: string): Promise<boolean>;
    private url;
    private headers;
    private decode;
}
//# sourceMappingURL=client.d.ts.map