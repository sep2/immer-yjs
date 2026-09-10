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

## Watching re-renders

`main.tsx` starts [react-scan](https://github.com/aidenybai/react-scan), which outlines each component
as it re-renders. Because every snapshot is immutable and the selectors return primitives, a
`memo`-wrapped component only re-renders when the value it selected actually changed: typing in the
text field outlines `TextView` and the JSON pane, and leaves `CounterView` alone.

`scan()` is called with no options—`trackUnnecessaryRenders` appears in react-scan's type definitions
but is rejected by its runtime validator in 0.5.7.

## Validating the document

A `Y.Doc` carries no schema, and this one is shared with untrusted peers, so a synced document may hold
anything. Every selector and every update in `DemoApp.tsx` therefore narrows the snapshot with the
`isAppState` guard before reading a field.

Note that this validates with a **type guard** rather than a parser. `useSelection` is built on
`useSyncExternalStore`, which compares selector results with `Object.is`; a parser allocates a fresh
result object on every call, so using one as a selector would re-render forever. A guard returns the
same reference, narrowed, and is therefore stable.
