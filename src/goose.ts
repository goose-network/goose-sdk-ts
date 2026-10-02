// src/goose.ts — typed resource methods over GooseClient.
//
// One method group per admin-API resource; parameter and body types come
// from the generated schema, so any spec change shows up as a type error
// here after `npm run generate`.

import type { components } from "./schema.js";
import { GooseClient } from "./client.js";
import type { ChainSpec, Engine, Inbound, OutboundSpec, Pool, RequestMetric } from "./types.js";

type EngineConfig = components["schemas"]["config.Engine"];

/** Typed client for the goose admin API. */
export class Goose {
  readonly client: GooseClient;

  constructor(
    baseUrlOrClient: string | GooseClient,
    token?: string,
  ) {
    this.client =
      baseUrlOrClient instanceof GooseClient
        ? baseUrlOrClient
        : new GooseClient(
            token === undefined
              ? { baseUrl: baseUrlOrClient }
              : { baseUrl: baseUrlOrClient, token },
          );
  }

  // --- engine ---

  /** Get the engine-level configuration. */
  getEngine(): Promise<Engine> {
    return this.client.get<Engine>("/api/engine");
  }

  /** Replace the engine-level configuration. */
  setEngine(engine: EngineConfig): Promise<Engine> {
    return this.client.send<Engine>("PUT", "/api/engine", engine);
  }

  // --- inbounds ---

  /** List all inbound listeners. */
  listInbounds(): Promise<Inbound[]> {
    return this.client.get<Inbound[]>("/api/inbounds");
  }

  /** Get one inbound by id. */
  getInbound(id: string): Promise<Inbound> {
    return this.client.get<Inbound>(`/api/inbounds/${encodeURIComponent(id)}`);
  }

  /** Create or replace an inbound (collection form; the body carries the id). */
  createInbound(inbound: Inbound): Promise<Inbound> {
    return this.client.send<Inbound>("POST", "/api/inbounds", inbound);
  }

  /** Create or replace an inbound at an explicit path id. */
  putInbound(id: string, inbound: Partial<Inbound>): Promise<Inbound> {
    return this.client.send<Inbound>(
      "PUT",
      `/api/inbounds/${encodeURIComponent(id)}`,
      inbound,
    );
  }

  /**
   * Delete an inbound. Returns false when the id did not exist (404).
   */
  async deleteInbound(id: string): Promise<boolean> {
    return this.client.delete(`/api/inbounds/${encodeURIComponent(id)}`);
  }

  // --- outbounds ---

  /** List all outbound specs. */
  listOutbounds(): Promise<OutboundSpec[]> {
    return this.client.get<OutboundSpec[]>("/api/outbounds");
  }

  /** Get one outbound by id. */
  getOutbound(id: string): Promise<OutboundSpec> {
    return this.client.get<OutboundSpec>(`/api/outbounds/${encodeURIComponent(id)}`);
  }

  /** Create or replace an outbound (collection form). */
  createOutbound(outbound: OutboundSpec): Promise<OutboundSpec> {
    return this.client.send<OutboundSpec>("POST", "/api/outbounds", outbound);
  }

  /** Create or replace an outbound at an explicit path id. */
  putOutbound(id: string, outbound: Partial<OutboundSpec>): Promise<OutboundSpec> {
    return this.client.send<OutboundSpec>(
      "PUT",
      `/api/outbounds/${encodeURIComponent(id)}`,
      outbound,
    );
  }

  /** Delete an outbound. Returns false when the id did not exist (404). */
  async deleteOutbound(id: string): Promise<boolean> {
    return this.client.delete(`/api/outbounds/${encodeURIComponent(id)}`);
  }

  // --- pools ---

  /** List all pools. */
  listPools(): Promise<Pool[]> {
    return this.client.get<Pool[]>("/api/pools");
  }

  /** Get one pool by id. */
  getPool(id: string): Promise<Pool> {
    return this.client.get<Pool>(`/api/pools/${encodeURIComponent(id)}`);
  }

  /** Create or replace a pool (collection form). */
  createPool(pool: Pool): Promise<Pool> {
    return this.client.send<Pool>("POST", "/api/pools", pool);
  }

  /** Create or replace a pool at an explicit path id. */
  putPool(id: string, pool: Partial<Pool>): Promise<Pool> {
    return this.client.send<Pool>("PUT", `/api/pools/${encodeURIComponent(id)}`, pool);
  }

  /** Delete a pool. Returns false when the id did not exist (404). */
  async deletePool(id: string): Promise<boolean> {
    return this.client.delete(`/api/pools/${encodeURIComponent(id)}`);
  }

  // --- chains ---

  /** List all chains. */
  listChains(): Promise<ChainSpec[]> {
    return this.client.get<ChainSpec[]>("/api/chains");
  }

  /** Get one chain by id. */
  getChain(id: string): Promise<ChainSpec> {
    return this.client.get<ChainSpec>(`/api/chains/${encodeURIComponent(id)}`);
  }

  /** Create or replace a chain (collection form). */
  createChain(chain: ChainSpec): Promise<ChainSpec> {
    return this.client.send<ChainSpec>("POST", "/api/chains", chain);
  }

  /** Create or replace a chain at an explicit path id. */
  putChain(id: string, chain: Partial<ChainSpec>): Promise<ChainSpec> {
    return this.client.send<ChainSpec>(
      "PUT",
      `/api/chains/${encodeURIComponent(id)}`,
      chain,
    );
  }

  /** Delete a chain. Returns false when the id did not exist (404). */
  async deleteChain(id: string): Promise<boolean> {
    return this.client.delete(`/api/chains/${encodeURIComponent(id)}`);
  }

  // --- metrics ---

  /**
   * List recent request metrics, newest first.
   *
   * @param n how many records to return; the engine defaults to 100 and
   *        caps at 10000.
   */
  listMetrics(n?: number): Promise<RequestMetric[]> {
    const q = n === undefined ? "" : `?n=${encodeURIComponent(n)}`;
    return this.client.get<RequestMetric[]>(`/api/metrics${q}`);
  }
}
