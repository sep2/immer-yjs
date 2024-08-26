# immer-yjs

[![npm](https://img.shields.io/npm/v/immer-yjs.svg)](https://www.npmjs.com/package/immer-yjs)
[![size](https://img.shields.io/bundlephobia/minzip/immer-yjs)](https://bundlephobia.com/result?p=immer-yjs)

Combine immer & y.js

# What is this

[immer](https://github.com/immerjs/immer) is a library for easy immutable data manipulation using plain json structure. [y.js](https://github.com/yjs/yjs) is a CRDT library with mutation-based API. `immer-yjs` allows manipulating `y.js` data types with the api provided by `immer`.

-   Two-way binding between y.js and plain (nested) json object/array.
-   Efficient snapshot update with structural sharing, same as `immer`.
-   Updates to `y.js` are explicitly batched in transaction, you control the transaction boundary.
-   Always opt-in, non-intrusive by nature (the snapshot is just a plain object after all).
-   The snapshot shape & y.js binding aims to be fully customizable.
-   Typescript all the way (pure js is also supported).
-   Code is simple and small, no magic hidden behind, no vendor-locking.

Do:

```js
// any operation supported by immer
update((state) => {
    state.nested[0].key = {
        id: 123,
        p1: 'a',
        p2: ['a', 'b', 'c'],
    }
})
```

Instead of:

```js
Y.transact(state.doc, () => {
    const val = new Y.Map()
    val.set('id', 123)
    val.set('p1', 'a')

    const arr = new Y.Array()
    arr.push(['a', 'b', 'c'])
    val.set('p2', arr)

    state.get('nested').get(0).set('key', val)
})
```

# Installation

`yarn add immer-yjs immer yjs`

# Documentation

1. `import { bind } from 'immer-yjs'`.
2. Create a binder: `const binder = bind(doc.getMap("state"))`.
3. Add subscription to the snapshot: `binder.subscribe(listener)`.
    1. Mutations in `y.js` data types will trigger snapshot subscriptions.
    2. Calling `update(...)` (similar to `produce(...)` in `immer`) will update their corresponding `y.js` types and also trigger snapshot subscriptions.
4. Call `binder.get()` to get the latest snapshot.
5. (Optionally) call `binder.unbind()` to release the observer.

`Y.Map` binds to plain object `{}`, `Y.Array` binds to plain array `[]`, and any level of nested `Y.Map`/`Y.Array` binds to nested plain json object/array respectively.

`Y.XmlElement` & `Y.Text` have no equivalent to json data types, so they are not supported by default. If you want to use them, please use the `y.js` top-level type (e.g. `doc.getText("xxx")`) directly, or see **Customize binding & schema** section below.

## With Vanilla Javascript/Typescript

🚀🚀🚀 [Please see the test for detailed usage.](https://github.com/sep2/immer-yjs/blob/main/packages/immer-yjs/src/immer-yjs.test.ts) 🚀🚀🚀

## Customize binding & schema

Use the [`applyPatch` option](https://github.com/sep2/immer-yjs/blob/6b50fdfa85c9ca8ac850075bda7ef456337c7d55/packages/immer-yjs/src/immer-yjs.test.ts#L136) to customize it. Check the [discussion](https://github.com/sep2/immer-yjs/issues/1) for detailed background.

## Integration with React

By leveraging [useSyncExternalStoreWithSelector](https://github.com/reactwg/react-18/discussions/86).

```tsx
import { bind } from 'immer-yjs'

// define state shape (not necessarily in js)
interface State {
    // any nested plain json data type
    nested: { count: number }[]
}

const doc = new Y.Doc()

// optionally set initial data to doc.getMap('data')

// define store
const binder = bind<State>(doc.getMap('data'))

// define a helper hook
function useImmerYjs<Selection>(selector: (state: State) => Selection) {
    const selection = useSyncExternalStoreWithSelector(binder.subscribe, binder.get, binder.get, selector)

    return [selection, binder.update]
}

// optionally set initial data
binder.update((state) => {
    state.nested = [{ count: 0 }]
})

// use in component
function Component() {
    const [count, update] = useImmerYjs((s) => s.nested[0].count)

    const handleClick = () => {
        update((s) => {
            // any operation supported by immer
            s.nested[0].count++
        })
    }

    // will only rerender when 'count' changed
    return <button onClick={handleClick}>{count}</button>
}

// when done
binder.unbind()
```

## Integration with other frameworks

Please submit with sample code by PR, helps needed.

# Demos

Data will sync between multiple browser tabs automatically.

-   [Messages Object](https://codesandbox.io/s/immer-yjs-demo-6e0znb)

# Changelog

[Changelog](https://github.com/sep2/immer-yjs/blob/main/packages/immer-yjs/CHANGELOG.md)

# Contributions are welcome

Please open an issue to discuss first if the PR contains significant changes.

# Similar projects

[valtio-yjs](https://github.com/dai-shi/valtio-yjs)
