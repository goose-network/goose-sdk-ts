// src/index.ts — the public surface of the goose TS SDK.
//
// Two layers are exported:
//   1. `Goose` — a typed, method-per-resource client over the admin API.
//   2. `schema` — the raw generated OpenAPI types (paths/components), for
//      callers that want to build their own transport.

export * from "./types.js";
export { GooseClient, GooseApiError } from "./client.js";
export type { GooseClientOptions } from "./client.js";
export { Goose } from "./goose.js";
export type * as schema from "./schema.js";
