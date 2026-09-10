# immer-yjs React example

A minimal React app demonstrating [`immer-yjs`](../../packages/immer-yjs): a `Y.Doc` is shared between
browser peers over WebRTC, and components read and write it with `immer`-style mutations instead of
hand-written patches.

## Running

From the repository root:

```sh
yarn workspace immer-yjs-react-example dev
```

Open the printed URL in two windows to watch edits propagate between them.

## How it fits together

| File                 | Role                                                                                                                         |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `immer-yjs-react.ts` | The React bindings: `useImmerYjs` creates and binds the document, `useSelection` subscribes to it, `useBinder` writes to it. |
| `DemoApp.tsx`        | Attaches a `WebrtcProvider` and renders a counter and a text field backed by the shared document.                            |
| `AppState.ts`        | The shape of the document, plus a [`pure-parse`](https://github.com/johannes-lindgren/pure-parse) type guard for it.         |
| `JsonView.tsx`       | Renders the document as a tree of memoized nodes, one component per value.                                                   |

## Watching re-renders

`App.tsx` drives [react-scan](https://github.com/aidenybai/react-scan) through its `useScan` hook, wired
to a "Highlight re-renders" switch that defaults to off. `main.tsx` imports the package for its side
effect only, and keeps that import above the React import: react-scan installs the React DevTools hook
when it loads, and can only instrument React if it runs first.

Switch it on and type in the text field. immer-yjs snapshots are immutable and structurally shared—an
update rebuilds only the path from the root down to the value that changed—so `memo` skips every
untouched subtree. `JsonView.tsx` leans on this by rendering one memoized component per JSON value
rather than stringifying the document: a single keystroke re-renders the `"text"` row and leaves the
`"count"` row untouched. Stringifying instead would rebuild every line on every keystroke.

Two react-scan quirks worth knowing: `useScan` is called without `trackUnnecessaryRenders`, which
appears in its type definitions but is rejected by its runtime validator in 0.5.7; and switching the
scan off leaves any already-drawn outlines on screen until the next reload, since react-scan does not
clear its overlay when paused.

## Validating the document

A `Y.Doc` carries no schema, and this one is shared with untrusted peers, so a synced document may hold
anything. Every selector and every update in `DemoApp.tsx` therefore narrows the snapshot with the
`isAppState` guard before reading a field.

Note that this validates with a **type guard** rather than a parser. `useSelection` is built on
`useSyncExternalStore`, which compares selector results with `Object.is`; a parser allocates a fresh
result object on every call, so using one as a selector would re-render forever. A guard returns the
same reference, narrowed, and is therefore stable.
