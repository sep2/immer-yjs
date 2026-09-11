// Exercises the library for real against its *published* entry point, so that a
// broken `exports` map or a wrong `"type"` field fails loudly instead of only
// tripping up type checking.
//
// Deliberately free of Node-only globals (`node:assert`, `process`) so the same
// file can run unchanged in every environment declared in vitest.config.ts.

import { describe, expect, it, onTestFinished } from 'vitest'
import * as Y from 'yjs'
import { bind } from 'immer-yjs'

type State = { count: number; items: { id: string }[] }

// Builds a fresh doc and binder per call, so no state is shared between tests.
const bindSeeded = () => {
    const doc = new Y.Doc()
    const binder = bind<State>(doc.getMap('state'))
    onTestFinished(() => binder.unbind())

    // Seeding through update() converts plain json into the y.js types.
    binder.update((state) => {
        state.count = 0
        state.items = [{ id: 'a' }]
    })

    return { doc, binder }
}

const itemsOf = (doc: Y.Doc) => doc.getMap('state').get('items') as Y.Array<unknown>

describe('immer-yjs', () => {
    it('converts seeded json into y.js types', () => {
        const { doc, binder } = bindSeeded()

        expect(binder.get()).toEqual({ count: 0, items: [{ id: 'a' }] })
        expect(itemsOf(doc)).toBeInstanceOf(Y.Array)
    })

    it('propagates immer updates to the snapshot', () => {
        const { binder } = bindSeeded()

        binder.update((state) => {
            state.count += 1
        })

        expect(binder.get().count).toBe(1)
    })

    it('propagates mutations made straight on the y.js type', () => {
        const { doc, binder } = bindSeeded()

        const item = new Y.Map<unknown>()
        itemsOf(doc).push([item])
        item.set('id', 'b')

        expect(binder.get().items).toEqual([{ id: 'a' }, { id: 'b' }])
    })

    it('produces frozen, structurally shared snapshots', () => {
        const { binder } = bindSeeded()

        expect(Object.isFrozen(binder.get())).toBe(true)
        expect(binder.get()).toBe(binder.get())
    })

    describe('subscribe', () => {
        it('notifies on updates from both directions of the binding', () => {
            const { doc, binder } = bindSeeded()
            const seen: State[] = []
            binder.subscribe((snapshot) => void seen.push(snapshot))

            binder.update((state) => {
                state.count += 1
            })
            itemsOf(doc).push([new Y.Map<unknown>()])

            expect(seen).toHaveLength(2)
        })

        it('stops notifying once unsubscribed', () => {
            const { binder } = bindSeeded()
            const seen: State[] = []
            const unsubscribe = binder.subscribe((snapshot) => void seen.push(snapshot))

            unsubscribe()
            binder.update((state) => {
                state.count += 1
            })

            expect(seen).toHaveLength(0)
        })
    })
})
