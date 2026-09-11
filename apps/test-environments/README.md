# test-environments

Verifies that the public API of [`immer-yjs`](../../packages/immer-yjs) can be imported, type-checked
and executed under every environment consumers actually use.

The package is published as ESM only, so this app is what catches a broken `exports` map, a wrong
`"type"` field, or declarations that resolve in one strategy but not another.

Everything here resolves `immer-yjs` **by package name**, so it exercises the published `exports` map
and the built `dist` rather than the source.

That is the division of labour with the library's own suite: `packages/immer-yjs` tests behaviour
against the source (in `node` and `happy-dom`), while this app tests what only breaks once the package
is built and published. A simulated DOM cannot tell you whether the real `dist` loads in a real
browser, which is why this side uses Playwright.

## What is tested

1. That `immer-yjs` exports the types and functions we advertise as public — and nothing we don't
   (`src/exports.ts`).
2. That those exports type-check under each module resolution strategy below.
3. That the library actually runs, binding a real `Y.Doc` in both directions, in each runtime below
   (`src/smoke.test.ts`).

## Module resolution strategies

`tsconfig.json` is a solution file that references one project per strategy; they share
`tsconfig.base.json` and differ only in `module` / `moduleResolution`. All three are type-check only.

| Config                   | `module`   | `moduleResolution` | Represents                       |
| ------------------------ | ---------- | ------------------ | -------------------------------- |
| `tsconfig.bundler.json`  | `ESNext`   | `bundler`          | Vite, esbuild, webpack, Parcel   |
| `tsconfig.nodenext.json` | `NodeNext` | `NodeNext`         | Node.js ESM (`"type": "module"`) |
| `tsconfig.cjs.json`      | `CommonJS` | `node`             | Node.js CJS (`require()`)        |

## Runtimes

`vitest.config.ts` runs the one suite once per project:

| Project    | Environment               | Represents                    |
| ---------- | ------------------------- | ----------------------------- |
| `node`     | Node.js                   | Server-side and SSR consumers |
| `chromium` | Real Chromium, Playwright | Browser consumers             |

## Running

From the repository root:

```sh
yarn turbo run types:check test build --filter=test-environments
```

`types:check` runs all three resolution strategies in one `tsc -b`, `test` runs the suite in both
runtimes, and `build` bundles `src/exports.ts` with Vite to confirm a production bundler can consume
the package.

The browser project needs a one-time browser download:

```sh
yarn workspace test-environments playwright install chromium
```

Individual runtimes can be selected with `yarn workspace test-environments vitest run --project=node`.

## Known failure: `nodenext`

`types:check` currently fails on `tsconfig.nodenext.json`, and it is reporting a real packaging
defect rather than a problem with this app:

```
src/exports.ts(8,43): error TS2305: Module '"immer-yjs"' has no exported member 'bind'.
```

`immer-yjs` is `"type": "module"`, so its declarations are ESM. `dist/index.d.ts` re-exports its
siblings with extensionless specifiers (`export * from './immer-yjs'`), which ESM resolution rejects.
TypeScript therefore sees the entry declaration as exporting _nothing_, and every public name is
reported missing.

The runtime is unaffected — `test` passes in both runtimes, because Vite and Node both resolve the JS
fine. It is only `node16`/`nodenext` _type_ resolution that breaks, which is why `bundler` and `cjs`
pass.
