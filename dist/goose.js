// src/goose.ts — typed resource methods over GooseClient.
//
// One method group per admin-API resource; parameter and body types come
// from the generated schema, so any spec change shows up as a type error
// here after `npm run generate`.
import { GooseClient } from "./client.js";
/** Typed client for the goose admin API. */
export class Goose {
    client;
    constructor(baseUrlOrClient, token) {
        this.client =
            baseUrlOrClient instanceof GooseClient
                ? baseUrlOrClient
                : new GooseClient(token === undefined
                    ? { baseUrl: baseUrlOrClient }
                    : { baseUrl: baseUrlOrClient, token });
    }
    // --- engine ---
    /** Get the engine-level configuration. */
    getEngine() {
        return this.client.get("/api/engine");
    }
    /** Replace the engine-level configuration. */
    setEngine(engine) {
        return this.client.send("PUT", "/api/engine", engine);
    }
    // --- inbounds ---
    /** List all inbound listeners. */
    listInbounds() {
        return this.client.get("/api/inbounds");
    }
    /** Get one inbound by id. */
    getInbound(id) {
        return this.client.get(`/api/inbounds/${encodeURIComponent(id)}`);
    }
    /** Create or replace an inbound (collection form; the body carries the id). */
    createInbound(inbound) {
        return this.client.send("POST", "/api/inbounds", inbound);
    }
    /** Create or replace an inbound at an explicit path id. */
    putInbound(id, inbound) {
        return this.client.send("PUT", `/api/inbounds/${encodeURIComponent(id)}`, inbound);
    }
    /**
     * Delete an inbound. Returns false when the id did not exist (404).
     */
    async deleteInbound(id) {
        return this.client.delete(`/api/inbounds/${encodeURIComponent(id)}`);
    }
    // --- outbounds ---
    /** List all outbound specs. */
    listOutbounds() {
        return this.client.get("/api/outbounds");
    }
    /** Get one outbound by id. */
    getOutbound(id) {
        return this.client.get(`/api/outbounds/${encodeURIComponent(id)}`);
    }
    /** Create or replace an outbound (collection form). */
    createOutbound(outbound) {
        return this.client.send("POST", "/api/outbounds", outbound);
    }
    /** Create or replace an outbound at an explicit path id. */
    putOutbound(id, outbound) {
        return this.client.send("PUT", `/api/outbounds/${encodeURIComponent(id)}`, outbound);
    }
    /** Delete an outbound. Returns false when the id did not exist (404). */
    async deleteOutbound(id) {
        return this.client.delete(`/api/outbounds/${encodeURIComponent(id)}`);
    }
    // --- pools ---
    /** List all pools. */
    listPools() {
        return this.client.get("/api/pools");
    }
    /** Get one pool by id. */
    getPool(id) {
        return this.client.get(`/api/pools/${encodeURIComponent(id)}`);
    }
    /** Create or replace a pool (collection form). */
    createPool(pool) {
        return this.client.send("POST", "/api/pools", pool);
    }
    /** Create or replace a pool at an explicit path id. */
    putPool(id, pool) {
        return this.client.send("PUT", `/api/pools/${encodeURIComponent(id)}`, pool);
    }
    /** Delete a pool. Returns false when the id did not exist (404). */
    async deletePool(id) {
        return this.client.delete(`/api/pools/${encodeURIComponent(id)}`);
    }
    // --- chains ---
    /** List all chains. */
    listChains() {
        return this.client.get("/api/chains");
    }
    /** Get one chain by id. */
    getChain(id) {
        return this.client.get(`/api/chains/${encodeURIComponent(id)}`);
    }
    /** Create or replace a chain (collection form). */
    createChain(chain) {
        return this.client.send("POST", "/api/chains", chain);
    }
    /** Create or replace a chain at an explicit path id. */
    putChain(id, chain) {
        return this.client.send("PUT", `/api/chains/${encodeURIComponent(id)}`, chain);
    }
    /** Delete a chain. Returns false when the id did not exist (404). */
    async deleteChain(id) {
        return this.client.delete(`/api/chains/${encodeURIComponent(id)}`);
    }
    // --- providers ---
    /**
     * List all dynamic outbound providers. Each provider owns a managed pool
     * that its outbounds are merged into.
     */
    listProviders() {
        return this.client.get("/api/providers");
    }
    /** Get one provider spec by id. */
    getProvider(id) {
        return this.client.get(`/api/providers/${encodeURIComponent(id)}`);
    }
    /** Create or replace a provider (collection form; the body carries the id). */
    createProvider(provider) {
        return this.client.send("POST", "/api/providers", provider);
    }
    /** Create or replace a provider at an explicit path id. */
    putProvider(id, provider) {
        return this.client.send("PUT", `/api/providers/${encodeURIComponent(id)}`, provider);
    }
    /** Delete a provider. Returns false when the id did not exist (404). */
    async deleteProvider(id) {
        return this.client.delete(`/api/providers/${encodeURIComponent(id)}`);
    }
    // --- metrics ---
    /**
     * List recent request metrics, newest first.
     *
     * @param n how many records to return; the engine defaults to 100 and
     *        caps at 10000.
     */
    listMetrics(n) {
        const q = n === undefined ? "" : `?n=${encodeURIComponent(n)}`;
        return this.client.get(`/api/metrics${q}`);
    }
}
//# sourceMappingURL=goose.js.map