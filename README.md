# goose-sdk-ts

TypeScript SDK for the [goose](https://github.com/goose-network/goose)
proxy-pool engine's admin API.

The SDK is **generated from the engine's OpenAPI spec**
(`internal/api/docs/swagger.json` in the goose repo): `npm run generate`
fetches the spec from goose `main`, converts it Swagger 2.0 → OpenAPI 3.0
and runs [openapi-typescript](https://github.com/openapi-ts/openapi-typescript)
to produce `src/schema.ts`. The hand-written layer on top (`src/client.ts`,
`src/goose.ts`) is a small fetch client plus one typed method group per
resource. A GitHub workflow regenerates and publishes the SDK whenever the
spec changes.

## Install

```sh
npm install @goose-network/goose-sdk
```

## Usage

```ts
import { Goose } from "@goose-network/goose-sdk";

const goose = new Goose("http://127.0.0.1:9090", "admin-token");

// engine config
const engine = await goose.getEngine();

// inbounds (http/socks5 listeners)
await goose.createInbound({
  id: "in-1",
  protocol: "http",
  listen: "127.0.0.1:18080",
});
const inbounds = await goose.listInbounds();

// outbounds + pools + chains
await goose.createOutbound({
  id: "ob-1",
  protocol: "http",
  config: { url: "http://proxy.example:3128" },
});
await goose.createPool({
  id: "pool-1",
  outbound_ids: ["ob-1"],
  filters: [],
  selector: { type: "roundrobin" },
});
await goose.createChain({ id: "chain-1", layers: ["pool-1"] });

// recent request metrics
const metrics = await goose.listMetrics(50);
```

Errors from non-2xx responses throw `GooseApiError` with `status` and the
parsed error body:

```ts
import { GooseApiError } from "@goose-network/goose-sdk";

try {
  await goose.setEngine({ stack: "bogus" });
} catch (err) {
  if (err instanceof GooseApiError) console.error(err.status, err.message);
}
```

## Development

```sh
npm install
npm run generate   # regenerate src/schema.ts from the goose OpenAPI spec
npm run build     # generate + tsc
npm test          # vitest
```

Set `GOOSE_SPEC_LOCAL=/path/to/swagger.json` to generate from a local spec
file instead of fetching from GitHub; `GOOSE_SPEC_URL` overrides the fetch
location.

## How the pieces fit

| File                | Role                                                            |
| ------------------- | --------------------------------------------------------------- |
| `src/schema.ts`     | generated types (`paths`, `components`) — do not edit by hand    |
| `src/types.ts`      | friendly re-exports of the schema types                         |
| `src/client.ts`     | fetch transport: base URL, bearer auth, JSON, error handling   |
| `src/goose.ts`      | `Goose` class: one typed method group per API resource           |
| `scripts/generate.mjs` | spec → OpenAPI 3 → `src/schema.ts` pipeline                  |

## License

MIT
