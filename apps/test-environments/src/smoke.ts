// Runs the library for real under Node, so that a broken `exports` map or a
// wrong `"type"` field fails loudly instead of only tripping up type checking.

import assert from 'node:assert/strict'
import * as Y from 'yjs'
import { bind } from 'immer-yjs'

type State = { count: number; items: { id: string }[] }

const doc = new Y.Doc()
const binder = bind<State>(doc.getMap('state'))

// Seeding through update() converts plain json into the y.js types.
binder.update((state) => {
    state.count = 0
    state.items = [{ id: 'a' }]
})

assert.deepEqual(binder.get(), { count: 0, items: [{ id: 'a' }] })
assert.ok(doc.getMap('state').get('items') instanceof Y.Array)

// Subscribers see snapshots produced by both directions of the binding.
const seen: State[] = []
const unsubscribe = binder.subscribe((snapshot) => void seen.push(snapshot))

binder.update((state) => {
    state.count += 1
})
assert.equal(binder.get().count, 1)

// A mutation made straight on the y.js type must reach the snapshot too.
const items = doc.getMap('state').get('items') as Y.Array<unknown>
const item = new Y.Map<unknown>()
items.push([item])
item.set('id', 'b')

assert.deepEqual(binder.get().items, [{ id: 'a' }, { id: 'b' }])
assert.equal(seen.length, 3, `expected 3 snapshots, got ${seen.length}`)

// Snapshots are frozen and structurally shared, as immer produces them.
assert.ok(Object.isFrozen(binder.get()))
assert.equal(binder.get(), binder.get())

unsubscribe()
binder.update((state) => {
    state.count += 1
})
assert.equal(seen.length, 3, 'unsubscribed listener was still called')

binder.unbind()

console.log('immer-yjs smoke test passed under Node', process.version)
