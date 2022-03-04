import produce, { enablePatches, Patch, produceWithPatches } from 'immer'
import * as Y from 'yjs'

import { JSONArray, JSONObject } from './types'
import { isJSONArray, isJSONObject, notImplemented, toPlainValue, toYDataType } from './util'

enablePatches()

export type Snapshot = JSONObject | JSONArray

function applyEvents<S extends Snapshot>(snapshot: S, events: Y.YEvent[]) {
    return produce(snapshot, (d) => {
        events.forEach((event) => {
            const base = event.path.reduce((obj, step) => {
                // @ts-ignore
                return obj[step]
            }, d)

            if (event instanceof Y.YMapEvent && isJSONObject(base)) {
                const source = event.target as Y.Map<any>

                event.changes.keys.forEach((change, key) => {
                    switch (change.action) {
                        case 'add':
                        case 'update':
                            base[key] = toPlainValue(source.get(key))
                            break
                        case 'delete':
                            delete base[key]
                            break
                    }
                })
            } else if (event instanceof Y.YArrayEvent && isJSONArray(base)) {
                const arr = base as unknown as any[]

                let retain = 0
                event.changes.delta.forEach((change) => {
                    if (change.retain) {
                        retain += change.retain
                    }
                    if (change.delete) {
                        arr.splice(retain, change.delete)
                    }
                    if (change.insert) {
                        if (Array.isArray(change.insert)) {
                            arr.splice(retain, 0, ...change.insert.map(toPlainValue))
                        } else {
                            arr.splice(retain, 0, toPlainValue(change.insert))
                        }
                        retain += change.insert.length
                    }
                })
            } else {
                notImplemented()
            }
        })
    })
}

const PATCH_REPLACE = 'replace'
const PATCH_ADD = 'add'
const PATCH_REMOVE = 'remove'

function applyPatch(target: Y.Map<any> | Y.Array<any>, patch: Patch) {
    const { path, op, value } = patch

    if (!path.length) {
        if (op !== PATCH_REPLACE) {
            notImplemented()
        }

        if (target instanceof Y.Map && isJSONObject(value)) {
            target.clear()
            for (const k in value) {
                target.set(k, toYDataType(value[k]))
            }
        } else if (target instanceof Y.Array && isJSONArray(value)) {
            target.delete(0, target.length)
            target.push(patch.value.map(toYDataType))
        } else {
            notImplemented()
        }

        return
    }

    let base = target
    for (let i = 0; i < path.length - 1; i++) {
        const step = path[i]
        base = base.get(step as never)
    }

    const property = path[path.length - 1]

    if (base instanceof Y.Map && typeof property === 'string') {
        switch (op) {
            case PATCH_ADD:
            case PATCH_REPLACE:
                base.set(property, toYDataType(value))
                break
            case PATCH_REMOVE:
                base.delete(property)
                break
        }
    } else if (base instanceof Y.Array && typeof property === 'number') {
        switch (op) {
            case PATCH_ADD:
                base.insert(property, [toYDataType(value)])
                break
            case PATCH_REPLACE:
                base.delete(property)
                base.insert(property, [toYDataType(value)])
                break
            case PATCH_REMOVE:
                base.delete(property)
                break
        }
    } else {
        notImplemented()
    }
}

export type UpdateFn<S extends Snapshot> = (draft: S) => void

function applyUpdate<S extends Snapshot>(source: Y.Map<any> | Y.Array<any>, snapshot: S, fn: UpdateFn<S>) {
    const [, patches] = produceWithPatches(snapshot, fn)
    patches.forEach((patch) => applyPatch(source, patch))
}

export type ListenerFn<S extends Snapshot> = (snapshot: S) => void
export type UnsubscribeFn = () => void

export type Binder<S extends Snapshot> = {
    unbind: () => void
    get: () => S
    update: (fn: UpdateFn<S>) => void
    subscribe: (fn: ListenerFn<S>) => UnsubscribeFn
}

export function bind<S extends Snapshot>(source: Y.Map<any> | Y.Array<any>): Binder<S> {
    let snapshot = source.toJSON() as S

    const get = () => snapshot

    const subscription = new Set<ListenerFn<S>>()

    const subscribe = (fn: ListenerFn<S>) => {
        subscription.add(fn)
        return () => void subscription.delete(fn)
    }

    const observer = (events: Y.YEvent[]) => {
        snapshot = applyEvents(get(), events)
        subscription.forEach((fn) => fn(get()))
    }

    source.observeDeep(observer)
    const unbind = () => source.unobserveDeep(observer)

    const update = (fn: UpdateFn<S>) => {
        const doc = source.doc

        if (doc) {
            Y.transact(doc, () => {
                applyUpdate(source, get(), fn)
            })
        } else {
            applyUpdate(source, get(), fn)
        }
    }

    return {
        unbind,
        get,
        update,
        subscribe,
    }
}
