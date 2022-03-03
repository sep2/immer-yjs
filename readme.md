# immer-yjs

[![npm](https://img.shields.io/npm/v/immer-yjs.svg)](https://www.npmjs.com/package/immer-yjs)
[![size](https://img.shields.io/bundlephobia/minzip/immer-yjs)](https://bundlephobia.com/result?p=immer-yjs)

Combine immer & y.js

# What is this
[immer](https://github.com/immerjs/immer) is a library for easy immutable data manipulation using plain json structure. [y.js](https://github.com/yjs/yjs) is a CRDT library with mutation-based API. `immer-yjs` allows manipulating `y.js` data types with the api provided by `immer`.

Efficient update is enabled by generating a new snapshot while mutating the exact part changed in the previous one, nothing more, just like with `immer`. Any change comes from `y.js` is also reflected in the new snapshot in the least impact manner.

This library is very simple and small, just ~200 lines of code, [no magic hidden behind](https://github.dev/sep2/immer-yjs/blob/main/packages/immer-yjs/src/immer-yjs.ts).

Do:
```js
update(state => {
    state.nested[0].key = {
        id: 123,
        p1: "a",
        p2: ["a", "b", "c"],
    }
})
```

Instead of:
```js
Y.transact(doc, () => {
    const val = new Y.Map()
    val.set("id", 123)
    val.set("p1", "a")

    const arr = new Y.Array()
    arr.push(["a", "b", "c"])
    val.set("p2", arr)

    state.get("nested").get(0).set("key", val)
})
```

# Installation
`yarn add immer-yjs immer yjs`


# Documentation

`Y.Map` binds to plain object `{}`, `Y.Array` binds to plain array `[]`, and any level of nested `Y.Map`/`Y.Array` is also supported, which binds to nested plain json data. Modifications in `y.js` data types are reflected to the snapshot of their corresponding plain json bindings. Calling `update(...)` (similar to `produce(...)` in `immer`) will generate a new snapshot as well as update their corresponding `y.js` types.

`Y.XmlElement` & `Y.Text` have no equivalent to json data types, so they are not supported. If you want to use them, please use the `y.js` top-level type (e.g. `doc.getText("xxx")`) directly, or submit an issue describing your scenario & API expectation.

## With Vanilla Javascript/Typescript

🚀🚀🚀 [Please see the test for detailed usage.](https://github.dev/sep2/immer-yjs/blob/main/packages/immer-yjs/src/immer-yjs.test.ts) 🚀🚀🚀

## Integration with React
By leveraging [useSyncExternalStoreWithSelector](https://github.com/reactwg/react-18/discussions/86).

```tsx
import { bind } from 'immer-yjs'

// define state type
interface State {
    // any nested plain json data type
}

const doc = new Y.Doc()

// optionally set initial data to doc.getMap('data')

// define store
const binder = bind<State>(doc.getMap('data'))

// define a helper hook
function useImmerYjs<Selection>(selector: (state: State) => Selection) {
    const selection = useSyncExternalStoreWithSelector(
        binder.subscribe,
        binder.get,
        binder.get,
        selector,
    )

    return [selection, binder.update]
}

// use in component
function Component() {
    const [count, update] = useImmerYjs((s) => s.nested[0].count)

    const handleClick = () => {
        update(s => {
            // any change supported by immer
            s.nested[0].count++
        })
    }

    return <button onClick={handleClick}>{count}</button>
}

// when done
binder.unbind()
```

# Demos
Data will sync between multiple browser tabs automatically.
* [Messages Object](https://codesandbox.io/s/immer-yjs-demo-6e0znb)

# Similar projects
[valtio-yjs](https://github.com/dai-shi/valtio-yjs)
