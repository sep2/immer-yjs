import { describe, expect, it } from 'vitest'
import * as Y from 'yjs'

import { JSONValue } from './types'
import {
    applyJsonArray,
    applyJsonObject,
    isJSONArray,
    isJSONObject,
    isJSONPrimitive,
    toPlainValue,
    toYDataType,
} from './util'

describe('util', () => {
    describe('isJSONPrimitive', () => {
        it('validates null', () => {
            expect(isJSONPrimitive(null)).toEqual(true)
        })
        it('validates strings', () => {
            expect(isJSONPrimitive('')).toEqual(true)
            expect(isJSONPrimitive('hello')).toEqual(true)
        })
        it('validates numbers', () => {
            expect(isJSONPrimitive(-1)).toEqual(true)
            expect(isJSONPrimitive(0)).toEqual(true)
            expect(isJSONPrimitive(1)).toEqual(true)
            expect(isJSONPrimitive(3.14)).toEqual(true)
        })
        it('validates booleans', () => {
            expect(isJSONPrimitive(true)).toEqual(true)
            expect(isJSONPrimitive(false)).toEqual(true)
        })
        it('invalidates arrays', () => {
            expect(isJSONPrimitive([])).toEqual(false)
        })
        it('invalidates object', () => {
            expect(isJSONPrimitive({ a: 1 })).toEqual(false)
        })
    })
    describe('isJSONArray', () => {
        it('validates empty arrays', () => {
            expect(isJSONArray([])).toEqual(true)
        })
        it('validates arrays with elements', () => {
            expect(isJSONArray([null])).toEqual(true)
            expect(isJSONArray([1, 2, 3])).toEqual(true)
            expect(isJSONArray(['a', 'b', 'c'])).toEqual(true)
            expect(isJSONArray([[], ['a'], ['b', 'c']])).toEqual(true)
            expect(isJSONArray([null, 1, 'a'])).toEqual(true)
        })
        it('invalidates primitives', () => {
            expect(isJSONArray(null)).toEqual(false)
            expect(isJSONArray(1)).toEqual(false)
            expect(isJSONArray('a')).toEqual(false)
            expect(isJSONArray(true)).toEqual(false)
            expect(isJSONArray(false)).toEqual(false)
        })
        it('invalidates objects', () => {
            expect(isJSONArray({})).toEqual(false)
            expect(isJSONArray({ a: 1 })).toEqual(false)
        })
    })
    describe('isJSONObject', () => {
        it('validates empty objects', () => {
            expect(isJSONObject({})).toEqual(true)
        })
        it('validates objects with properties', () => {
            expect(
                isJSONObject({
                    a: 1,
                    b: 'a',
                })
            ).toEqual(true)
        })
        it('invalidates primitives', () => {
            expect(isJSONObject(null)).toEqual(false)
            expect(isJSONObject(1)).toEqual(false)
            expect(isJSONObject('a')).toEqual(false)
            expect(isJSONObject(true)).toEqual(false)
            expect(isJSONObject(false)).toEqual(false)
        })
        it('invalidates arrays', () => {
            expect(isJSONObject([])).toEqual(false)
            expect(isJSONObject([1, 2, 3])).toEqual(false)
        })
    })
    describe('toYDataType', () => {
        it('works on primitives', () => {
            expect(toYDataType(null)).toEqual(null)
            expect(toYDataType(1)).toEqual(1)
            expect(toYDataType('a')).toEqual('a')
            expect(toYDataType(true)).toEqual(true)
            expect(toYDataType(false)).toEqual(false)
        })
        it('works on arrays', () => {
            const data = [1, 2, 3]
            const res = toYDataType(data)
            expect(res).toBeInstanceOf(Y.Array)
            if (!(res instanceof Y.Array)) {
                // The expect above already failed the test
                return
            }

            // Needs to be in a Y.Doc to be able to access the values
            const doc = new Y.Doc()
            const map = doc.getMap('myarray')
            map.set('dummy', res)

            expect(res.length).toEqual(data.length)
            data.forEach((value, index) => {
                expect(res.get(index)).toEqual(value)
            })
        })
        it('works on objects', () => {
            const data = {
                a: 1,
                b: '2',
                c: null,
            }
            const res = toYDataType(data)
            expect(res).toBeInstanceOf(Y.Map)
            if (!(res instanceof Y.Map)) {
                // The expect above already failed the test
                expect.fail('res is not a Y.Map')
                return
            }

            // Needs to be in a Y.Doc to be able to access the values
            const doc = new Y.Doc()
            const map = doc.getMap('myarray')
            map.set('dummy', res)

            Object.entries(data).forEach(([key, value]) => {
                expect(res.get(key)).toEqual(value)
            })
        })
        it('is recursive', () => {
            const data = {
                a: 1,
                b: '2',
                c: null,
                d: true,
                e: false,
                f: [1, 2, 3],
                g: {
                    f: 4,
                    g: '5',
                    h: null,
                },
            }
            const res = toYDataType(data)
            expect(res).toBeInstanceOf(Y.Map)
            if (!(res instanceof Y.Map)) {
                // The expect above already failed the test
                expect.fail('res is not a Y.Map')
                return
            }

            // Needs to be in a Y.Doc to be able to access the values
            const doc = new Y.Doc()
            const map = doc.getMap('myarray')
            map.set('dummy', res)

            expect(toPlainValue(res)).toEqual(data)
        })
    })
    describe('applyJsonArray', () => {
        it('works on primitives', () => {
            const data = [1, 'a', null, true, false]
            const doc = new Y.Doc()
            const arr = doc.getArray('dummy')
            applyJsonArray(arr, data)
            data.forEach((value, index) => {
                expect(arr.get(index)).toEqual(value)
            })
        })
        it('works on arrays', () => {
            const data = [[], [1], [1, 2]]
            const doc = new Y.Doc()
            const arr = doc.getArray('dummy')
            applyJsonArray(arr, data)
            data.forEach((value, index) => {
                const subArr = arr.get(index) as JSONValue
                expect(toPlainValue(subArr)).toEqual(value)
            })
        })
        it('works on objects', () => {
            const data = [
                { a: 1, b: 2 },
                { a: 3, b: 4 },
                { a: 'u', b: 'v' },
            ]
            const doc = new Y.Doc()
            const arr = doc.getArray('dummy')
            applyJsonArray(arr, data)
            data.forEach((value, index) => {
                const subArr = arr.get(index) as JSONValue
                expect(toPlainValue(subArr)).toEqual(value)
            })
        })
        it('is recursive', () => {
            const data = [{ a: { a: 1 } }, [[], [1], [1, 2]], { a: [] }]
            const doc = new Y.Doc()
            const arr = doc.getArray('dummy')
            applyJsonArray(arr, data)
            data.forEach((value, index) => {
                const subArr = arr.get(index) as JSONValue
                expect(toPlainValue(subArr)).toEqual(value)
            })
        })
    })
    describe('applyJsonObject', () => {
        it('works on primitives', () => {
            const data = {
                a: 1,
                b: 'a',
                c: null,
                d: true,
                e: false,
            }
            const doc = new Y.Doc()
            const map = doc.getMap('dummy')
            applyJsonObject(map, data)
            Object.entries(data).forEach(([key, value]) => {
                expect(map.get(key)).toEqual(value)
            })
        })
        it('works on arrays', () => {
            const data = { a: [], b: [1], c: [1, 2] }
            const doc = new Y.Doc()
            const map = doc.getMap('dummy')
            applyJsonObject(map, data)
            Object.entries(data).forEach(([key, value]) => {
                const prop = map.get(key) as JSONValue
                expect(toPlainValue(prop)).toEqual(value)
            })
        })
        it('works on objects', () => {
            const data = {
                a: { a: 1, b: 2 },
                b: { a: 3, b: 4 },
                c: { a: 'u', b: 'v' },
            }
            const doc = new Y.Doc()
            const map = doc.getMap('dummy')
            applyJsonObject(map, data)
            Object.entries(data).forEach(([key, value]) => {
                const prop = map.get(key) as JSONValue
                expect(toPlainValue(prop)).toEqual(value)
            })
        })
        it('is recursive', () => {
            const data = {
                a: { a: { a: 1 } },
                b: [[], [1], [1, 2]],
                c: { a: [] },
            }
            const doc = new Y.Doc()
            const map = doc.getMap('dummy')
            applyJsonObject(map, data)
            Object.entries(data).forEach(([key, value]) => {
                const prop = map.get(key) as JSONValue
                expect(toPlainValue(prop)).toEqual(value)
            })
        })
    })
    describe('toPlainValue', () => {
        it('converts primitives', () => {
            expect(toPlainValue(null)).toEqual(null)
            expect(toPlainValue(1)).toEqual(1)
            expect(toPlainValue('a')).toEqual('a')
            expect(toPlainValue(true)).toEqual(true)
            expect(toPlainValue(false)).toEqual(false)
        })
        it('converts arrays', () => {
            const data = [1, 2, 3]
            // Needs to be in a Y.Doc to be able to access the values
            const doc = new Y.Doc()
            const arr = doc.getArray('dummy')
            arr.push(data)
            expect(toPlainValue(arr)).toEqual(data)
        })
        it('converts objects', () => {
            const data = { a: 1, b: 2 }
            // Needs to be in a Y.Doc to be able to access the values
            const doc = new Y.Doc()
            const map = doc.getMap('dummy')
            map.set('dummy', data)
            expect(toPlainValue(map)).toEqual(data)
        })
        it('is recursive', () => {
            const data = {
                a: {
                    a: 1,
                    b: 'a',
                    c: false,
                    d: true,
                    e: null,
                },
                b: [1, 2, 3],
                c: [{ a: 1 }],
            }
            // Needs to be in a Y.Doc to be able to access the values
            const doc = new Y.Doc()
            const map = doc.getMap('dummy')
            map.set('dummy', data)
            expect(toPlainValue(map)).toEqual(data)
        })
    })
})
