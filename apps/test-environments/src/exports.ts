// Verifies that every public export of `immer-yjs` is importable and has the
// shape we advertise. Nothing here runs — it exists to be type-checked under
// each module resolution strategy.

import * as Y from 'yjs'

// Values
import { applyJsonArray, applyJsonObject, bind } from 'immer-yjs'

// Types
import type {
    Binder,
    JSONArray,
    JSONObject,
    JSONPrimitive,
    JSONValue,
    ListenerFn,
    Options,
    Snapshot,
    UnsubscribeFn,
    UpdateFn,
} from 'immer-yjs'

// @ts-expect-error -- test that importing something that doesn't exist gives an error
import { abcSomethingThatDoesNotExist } from 'immer-yjs'

type State = { count: number; items: string[] }

// Each public type is referenced in a type position so that it is actually checked.
export const typeUsages: {
    binder: Binder<State>
    jsonArray: JSONArray
    jsonObject: JSONObject
    jsonPrimitive: JSONPrimitive
    jsonValue: JSONValue
    listener: ListenerFn<State>
    options: Options
    snapshot: Snapshot
    unsubscribe: UnsubscribeFn
    update: UpdateFn<State>
} = {
    binder: bind<State>(new Y.Doc().getMap('state')),
    jsonArray: [1, 'two', false, null, { nested: [] }],
    jsonObject: { a: 1 },
    jsonPrimitive: 'a',
    jsonValue: { a: [1, null] },
    listener: (snapshot) => void snapshot.count,
    options: { applyPatch: (target, patch, applyPatch) => applyPatch(target, patch) },
    snapshot: { a: 1 },
    unsubscribe: () => undefined,
    update: (draft) => void draft.items.push('x'),
}

// The value exports are callable with the signatures we document.
export const valueUsages = {
    bind,
    applyJsonArray: (dest: Y.Array<unknown>, source: JSONArray) => applyJsonArray(dest, source),
    applyJsonObject: (dest: Y.Map<unknown>, source: JSONObject) => applyJsonObject(dest, source),
}
