// src/types.ts — re-exports of the generated schema types callers need most.
// Aliases keep the generated `config.*` / `core.*` names out of the public
// API surface while staying structurally identical.

import type { components, paths } from "./schema.js";

export type Engine = components["schemas"]["config.Engine"];
export type Inbound = components["schemas"]["config.Inbound"];
export type OutboundSpec = components["schemas"]["config.OutboundSpec"];
export type Pool = components["schemas"]["config.Pool"];
export type ChainSpec = components["schemas"]["config.ChainSpec"];
export type RequestMetric = components["schemas"]["core.RequestMetric"];
export type ApiError = components["schemas"]["api.errResponse"];

export type { components, paths };
