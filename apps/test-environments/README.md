# test-environments

Verifies that the public API of [`immer-yjs`](../../packages/immer-yjs) can be imported, type-checked
and executed under different environment:

- Browser (Chromium)
- Node.js

## What is tested

1. That `immer-yjs` exports the types and functions we advertise as public — and nothing we don't
   (`src/exports.ts`).
2. That those exports type-check under each module resolution strategy below.
3. That the library actually runs, binding a real `Y.Doc` in both directions, in each runtime below
   (`src/smoke.test.ts`).
