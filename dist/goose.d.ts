import type { components } from "./schema.js";
import { GooseClient } from "./client.js";
import type { ChainSpec, Engine, Inbound, OutboundSpec, Pool, RequestMetric } from "./types.js";
type EngineConfig = components["schemas"]["config.Engine"];
/** Typed client for the goose admin API. */
export declare class Goose {
    readonly client: GooseClient;
    constructor(baseUrlOrClient: string | GooseClient, token?: string);
    /** Get the engine-level configuration. */
    getEngine(): Promise<Engine>;
    /** Replace the engine-level configuration. */
    setEngine(engine: EngineConfig): Promise<Engine>;
    /** List all inbound listeners. */
    listInbounds(): Promise<Inbound[]>;
    /** Get one inbound by id. */
    getInbound(id: string): Promise<Inbound>;
    /** Create or replace an inbound (collection form; the body carries the id). */
    createInbound(inbound: Inbound): Promise<Inbound>;
    /** Create or replace an inbound at an explicit path id. */
    putInbound(id: string, inbound: Partial<Inbound>): Promise<Inbound>;
    /**
     * Delete an inbound. Returns false when the id did not exist (404).
     */
    deleteInbound(id: string): Promise<boolean>;
    /** List all outbound specs. */
    listOutbounds(): Promise<OutboundSpec[]>;
    /** Get one outbound by id. */
    getOutbound(id: string): Promise<OutboundSpec>;
    /** Create or replace an outbound (collection form). */
    createOutbound(outbound: OutboundSpec): Promise<OutboundSpec>;
    /** Create or replace an outbound at an explicit path id. */
    putOutbound(id: string, outbound: Partial<OutboundSpec>): Promise<OutboundSpec>;
    /** Delete an outbound. Returns false when the id did not exist (404). */
    deleteOutbound(id: string): Promise<boolean>;
    /** List all pools. */
    listPools(): Promise<Pool[]>;
    /** Get one pool by id. */
    getPool(id: string): Promise<Pool>;
    /** Create or replace a pool (collection form). */
    createPool(pool: Pool): Promise<Pool>;
    /** Create or replace a pool at an explicit path id. */
    putPool(id: string, pool: Partial<Pool>): Promise<Pool>;
    /** Delete a pool. Returns false when the id did not exist (404). */
    deletePool(id: string): Promise<boolean>;
    /** List all chains. */
    listChains(): Promise<ChainSpec[]>;
    /** Get one chain by id. */
    getChain(id: string): Promise<ChainSpec>;
    /** Create or replace a chain (collection form). */
    createChain(chain: ChainSpec): Promise<ChainSpec>;
    /** Create or replace a chain at an explicit path id. */
    putChain(id: string, chain: Partial<ChainSpec>): Promise<ChainSpec>;
    /** Delete a chain. Returns false when the id did not exist (404). */
    deleteChain(id: string): Promise<boolean>;
    /**
     * List recent request metrics, newest first.
     *
     * @param n how many records to return; the engine defaults to 100 and
     *        caps at 10000.
     */
    listMetrics(n?: number): Promise<RequestMetric[]>;
}
export {};
//# sourceMappingURL=goose.d.ts.map