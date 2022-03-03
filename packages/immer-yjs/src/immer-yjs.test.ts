import { expect, test } from 'vitest'
import * as Y from 'yjs'

import { bind } from './immer-yjs'
import { createSampleArray, createSampleObject, SampleArray, SampleObject } from './sample-data'
import { JSONArray, JSONObject } from './types'
import { applyJsonArray, applyJsonObject, isJSONArray, isJSONObject, notImplemented } from './util'

// helper for setup document recursively
function setupDocument(doc: Y.Doc, struct: Record<string, JSONObject | JSONArray>, origin?: any) {
    Y.transact(
        doc,
        () => {
            Object.entries(struct).forEach(([k, v]) => {
                if (isJSONObject(v)) {
                    applyJsonObject(doc.getMap(k), v)
                } else if (isJSONArray(v)) {
                    applyJsonArray(doc.getArray(k), v)
                } else {
                    notImplemented()
                }
            })
        },
        origin
    )
}

test('bind test', () => {
    const doc = new Y.Doc()

    const initialObj: SampleObject = createSampleObject() // plain object
    const initialArr: SampleArray = createSampleArray() // plain array

    const topLevelMap = 'map'
    const topLevelArray = 'arr'

    // initialize document with sample data
    setupDocument(doc, { [topLevelMap]: initialObj, [topLevelArray]: initialArr })

    // get reference of CRDT type for binding
    const map = doc.getMap(topLevelMap)
    // const arr = doc.getArray(topLevelArray) // doesn't test array yet

    // bind the top-level CRDT type, works for Y.Array as well
    const binder = bind<SampleObject>(map)

    // get current state as snapshot
    const snapshot1 = binder.get()

    // should equal to initial structurally
    expect(snapshot1).toStrictEqual(initialObj)

    // should equal to yjs structurally
    expect(snapshot1).toStrictEqual(map.toJSON())

    // get the reference to be compared after changes are made
    const yd1 = map.get('0001') as any

    // nested objects / arrays are properly converted to Y.Maps / Y.Arrays
    expect(yd1).toBeInstanceOf(Y.Map)
    expect(yd1.get('batters')).toBeInstanceOf(Y.Map)
    expect(yd1.get('topping')).toBeInstanceOf(Y.Array)
    expect(yd1.get('batters').get('batter')).toBeInstanceOf(Y.Array)
    expect(yd1.get('batters').get('batter').get(0).get('id')).toBeTypeOf('string')

    // update the state with immer
    binder.update((state) => {
        state['0001'].ppu += 0.1
        const d1 = state['0001']

        d1.topping.splice(2, 2, { id: '7777', type: 'test1' }, { id: '8888', type: 'test2' })
        d1.topping.push({ id: '9999', type: 'test3' })

        delete state['0003']
    })

    // get snapshot after modified
    const snapshot2 = binder.get()

    // snapshot1 unchanged
    expect(snapshot1).toStrictEqual(initialObj)

    // snapshot2 changed
    expect(snapshot1).not.equal(snapshot2)

    // changed properties should reflect what we did in update(...)
    expect(snapshot2['0001'].ppu).toStrictEqual(0.65)
    expect(snapshot2['0001'].topping.find((x) => x.id === '9999')).toStrictEqual({ id: '9999', type: 'test3' })
    expect(snapshot2['0003']).toBeUndefined()

    // reference changed as well
    expect(snapshot2['0001']).not.toBe(snapshot1['0001'])

    // unchanged properties should keep referential equality with previous snapshot
    expect(snapshot2['0002']).toBe(snapshot1['0002'])
    expect(snapshot2['0001'].batters).toBe(snapshot1['0001'].batters)
    expect(snapshot2['0001'].topping[0]).toBe(snapshot2['0001'].topping[0])

    // the underlying yjs data type reflect changes as well
    expect(map.toJSON()).toStrictEqual(snapshot2)

    // but yjs data type should not change reference (they are mutated in-place whenever possible)
    expect(map).toBe(doc.getMap(topLevelMap))
    expect(map.get('0001')).toBe(yd1)
    expect((map.get('0001') as any).get('topping')).toBe(yd1.get('topping'))

    // release the observer, so the CRDT type can be bind again
    binder.unbind()
})
