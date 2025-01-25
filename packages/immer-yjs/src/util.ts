import * as Y from 'yjs'

import { JSONArray, JSONObject, JSONPrimitive, JSONValue } from './types'

export function isJSONPrimitive(v: JSONValue): v is JSONPrimitive {
    const t = typeof v
    return t === 'string' || t === 'number' || t === 'boolean' || v === null
}

export function isJSONArray(v: JSONValue): v is JSONArray {
    return Array.isArray(v)
}

export function isJSONObject(v: JSONValue): v is JSONObject {
    return !isJSONArray(v) && typeof v === 'object' && v !== null
}

export function toYDataType(v: JSONValue) {
    if (isJSONArray(v)) {
        const arr = new Y.Array()
        applyJsonArray(arr, v)
        return arr
    } else if (isJSONObject(v)) {
        const map = new Y.Map()
        applyJsonObject(map, v)
        return map
    } else {
        return v
    }
}

export function applyJsonArray(dest: Y.Array<unknown>, source: JSONArray) {
    dest.push(source.map(toYDataType))
}

export function applyJsonObject(dest: Y.Map<unknown>, source: JSONObject) {
    Object.entries(source).forEach(([k, v]) => {
        dest.set(k, toYDataType(v))
    })
}

export function toPlainValue(v: Y.Map<unknown> | Y.Array<unknown> | JSONValue) {
    if (v instanceof Y.Map || v instanceof Y.Array) {
        return v.toJSON() as JSONObject | JSONArray
    } else {
        return v
    }
}

export function notImplemented(): never {
    throw new Error('not implemented')
}
