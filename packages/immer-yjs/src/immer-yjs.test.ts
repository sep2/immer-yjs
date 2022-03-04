import { expect, test } from 'vitest'
import * as Y from 'yjs'

import { bind } from './immer-yjs'
import { createSampleObject, id1, id2, id3 } from './sample-data'

test('bind usage demo', () => {
    const doc = new Y.Doc()

    const initialObj = createSampleObject() // plain object

    const topLevelMap = 'map'

    // get reference of CRDT type for binding
    const map = doc.getMap(topLevelMap)

    // bind the top-level CRDT type, works for Y.Array as well
    const binder = bind<typeof initialObj>(map)

    // initialize document with sample data
    binder.update(() => {
        return initialObj
    })

    // get current state as snapshot
    const snapshot1 = binder.get()

    // should equal to initial structurally
    expect(snapshot1).toStrictEqual(initialObj)

    // should equal to yjs structurally
    expect(snapshot1).toStrictEqual(map.toJSON())

    // get the reference to be compared after changes are made
    const yd1 = map.get(id1) as any

    // nested objects / arrays are properly converted to Y.Maps / Y.Arrays
    expect(yd1).toBeInstanceOf(Y.Map)
    expect(yd1.get('batters')).toBeInstanceOf(Y.Map)
    expect(yd1.get('topping')).toBeInstanceOf(Y.Array)
    expect(yd1.get('batters').get('batter')).toBeInstanceOf(Y.Array)
    expect(yd1.get('batters').get('batter').get(0).get('id')).toBeTypeOf('string')

    // update the state with immer
    binder.update((state) => {
        state[id1].ppu += 0.1
        const d1 = state[id1]

        d1.topping.splice(2, 2, { id: '7777', type: 'test1' }, { id: '8888', type: 'test2' })
        d1.topping.push({ id: '9999', type: 'test3' })

        delete state[id3]
    })

    // get snapshot after modified
    const snapshot2 = binder.get()

    // snapshot1 unchanged
    expect(snapshot1).toStrictEqual(initialObj)

    // snapshot2 changed
    expect(snapshot1).not.equal(snapshot2)

    // changed properties should reflect what we did in update(...)
    expect(snapshot2[id1].ppu).toStrictEqual(0.65)
    expect(snapshot2[id1].topping.find((x) => x.id === '9999')).toStrictEqual({ id: '9999', type: 'test3' })
    expect(snapshot2[id3]).toBeUndefined()

    // reference changed as well
    expect(snapshot2[id1]).not.toBe(snapshot1[id1])

    // unchanged properties should keep referential equality with previous snapshot
    expect(snapshot2[id2]).toBe(snapshot1[id2])
    expect(snapshot2[id1].batters).toBe(snapshot1[id1].batters)
    expect(snapshot2[id1].topping[0]).toBe(snapshot1[id1].topping[0])

    // the underlying yjs data type reflect changes as well
    expect(map.toJSON()).toStrictEqual(snapshot2)

    // but yjs data type should not change reference (they are mutated in-place whenever possible)
    expect(map).toBe(doc.getMap(topLevelMap))
    expect(map.get(id1)).toBe(yd1)
    expect((map.get(id1) as any).get('topping')).toBe(yd1.get('topping'))

    // save the length for later comparison
    const expectLength = binder.get()[id1].batters.batter.length

    // change from y.js
    yd1.get('batters')
        .get('batter')
        .push([{ id: '1005', type: 'test' }])

    // change reflected in snapshot
    expect(binder.get()[id1].batters.batter.at(-1)).toStrictEqual({ id: '1005', type: 'test' })

    // now the length + 1
    expect(binder.get()[id1].batters.batter.length).toBe(expectLength + 1)

    // delete something from yjs
    yd1.delete('topping')

    // deletion reflected in snapshot
    expect(binder.get()[id1].topping).toBeUndefined()

    // release the observer, so the CRDT type can be bind again
    binder.unbind()
})

test('boolean in array', () => {
    const doc = new Y.Doc()

    const map = doc.getMap('data')

    const binder = bind<any>(map)

    binder.update((state) => {
        state.k1 = true
        state.k2 = false
        state.k3 = [true, false, true]
    })

    expect(map.toJSON()).toStrictEqual({ k1: true, k2: false, k3: [true, false, true] })
})
