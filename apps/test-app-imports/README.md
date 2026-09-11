# test-app-imports

Verifies that the public API of [`immer-yjs`](../../packages/immer-yjs) can be imported, type-checked
and executed under every module resolution strategy consumers actually use.

The package is published as ESM only, so this app is what catches a broken `exports` map, a wrong
`"type"` field, or declarations that resolve in one strategy but not another.

## What is tested

1. That `immer-yjs` exports the types and functions we advertise as public — and nothing we don't
   (`src/exports.ts`).
2. That those exports type-check under each resolution strategy below.
3. That the library actually runs on Node, binding a real `Y.Doc` in both directions
   (`src/smoke.ts`).

## Configs

| Config                   | `module`   | `moduleResolution` | Represents                       |
| ------------------------ | ---------- | ------------------ | -------------------------------- |
| `tsconfig.bundler.json`  | `ESNext`   | `bundler`          | Vite, esbuild, webpack, Parcel   |
| `tsconfig.nodenext.json` | `NodeNext` | `NodeNext`         | Node.js ESM (`"type": "module"`) |
| `tsconfig.cjs.json`      | `CommonJS` | `node`             | Node.js CJS (`require()`)        |

## Running

From the repository root:

```sh
yarn workspace test-app-imports test
```

Each step can be run on its own: `test:types` type-checks all three configs, `test:build` emits the
Node build plus a bundler build, and `test:run` executes the Node build.

## Known failure: `nodenext`

`test:types` currently fails on `tsconfig.nodenext.json`, and it is reporting a real packaging
defect rather than a problem with this app:

```
src/exports.ts(8,43): error TS2305: Module '"immer-yjs"' has no exported member 'bind'.
```

`immer-yjs` is `"type": "module"`, so its declarations are ESM. `dist/index.d.ts` re-exports its
siblings with extensionless specifiers (`export * from './immer-yjs'`), which ESM resolution rejects.
TypeScript therefore sees the entry declaration as exporting _nothing_, and all 21 public names are
reported missing.

The runtime is unaffected — `test:run` passes, because bundlers and Node both resolve the JS fine.
It is only `node16`/`nodenext` _type_ resolution that breaks, which is why `bundler` and `cjs` pass.
