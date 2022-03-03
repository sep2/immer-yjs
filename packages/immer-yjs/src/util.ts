import * as Y from 'yjs'

import { JSONArray, JSONObject, JSONPrimitive, JSONValue } from './types'

export function isJSONPrimitive(v: JSONValue): v is JSONPrimitive {
    const t = typeof v
    return t === 'string' || t === 'number' || t === 'boolean' || t === null
}

export function isJSONArray(v: JSONValue): v is JSONArray {
    return Array.isArray(v)
}

export function isJSONObject(v: JSONValue): v is JSONObject {
    return !isJSONArray(v) && typeof v === 'object'
}

export function toYDataType(v: JSONValue) {
    if (isJSONPrimitive(v)) {
        return v
    } else if (isJSONArray(v)) {
        const arr = new Y.Array()
        applyJsonArray(arr, v)
        return arr
    } else if (isJSONObject(v)) {
        const map = new Y.Map()
        applyJsonObject(map, v)
        return map
    } else {
        return undefined
    }
}

export function applyJsonArray(dest: Y.Array<unknown>, source: JSONArray) {
    const converted = source.map(toYDataType).filter(Boolean)
    dest.push(converted)
}

export function applyJsonObject(dest: Y.Map<unknown>, source: JSONObject) {
    Object.entries(source).forEach(([k, v]) => {
        dest.set(k, toYDataType(v))
    })
}

export function toPlainValue(v: Y.Map<any> | Y.Array<any> | JSONValue) {
    if (v instanceof Y.Map || v instanceof Y.Array) {
        return v.toJSON() as JSONObject | JSONArray
    } else {
        return v
    }
}

export function notImplemented() {
    throw new Error('not implemented')
}
