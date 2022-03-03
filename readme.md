# immer-yjs

[![npm](https://img.shields.io/npm/v/immer-yjs.svg)](https://www.npmjs.com/package/immer-yjs)
[![size](https://img.shields.io/bundlephobia/minzip/immer-yjs)](https://bundlephobia.com/result?p=immer-yjs)

Combine immer & y.js

# What is this
[immer](https://github.com/immerjs/immer) is a library for easy immutable data manipulation using plain json structure. [y.js](https://github.com/yjs/yjs) is a CRDT library with mutation-based API. `immer-yjs` allows manipulating `y.js` data types with the api provided by `immer`.

Efficient update is enabled by generating a new snapshot while mutating the exact part changed in the previous one, nothing more, just like with `immer`. Any change comes from `y.js` is also reflected in the new snapshot in the least impact manner.

This library is very simple, just ~200 lines of code, [no magic here](https://github.dev/sep2/immer-yjs/blob/main/packages/immer-yjs/src/immer-yjs.ts).

Do:
```js
update(state => {
    state.nested[0].key = {
        id: 123,
        p1: "a",
        p2: "b",
    }
})
```

Instead of:
```js
Y.transact(doc, () => {
    const val = new Y.Map()
    val.set("id", 123)
    val.set("p1", "a")
    val.set("p2", "b")
    state.get("nested").get(0).set("key", val)
})
```

# Installation
`yarn add immer-yjs immer yjs`


# Documentation
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
        update(s => s.nested[0].count++)
    }

    return <button onClick={handleClick}>{count}</button>
}

// when done
binder.unbind()
```

# Similar projects
[valtio-yjs](https://github.com/dai-shi/valtio-yjs)
