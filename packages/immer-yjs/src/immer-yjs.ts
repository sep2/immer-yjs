import produce, { enablePatches, Patch, produceWithPatches } from 'immer'
import * as Y from 'yjs'

import { JSONArray, JSONObject } from './types'
import { isJSONArray, isJSONObject, notImplemented, toPlainValue, toYDataType } from './util'

enablePatches()

export type Snapshot = JSONObject | JSONArray

function applyEvents<S extends Snapshot>(snapshot: S, events: Y.YEvent[]) {
    return produce(snapshot, (d) => {
        events.forEach((event) => {
            const target = event.path.reduce((obj, step) => {
                // @ts-ignore
                return obj[step]
            }, d)

            if (event instanceof Y.YMapEvent && isJSONObject(target)) {
                const source = event.target as Y.Map<any>

                event.changes.keys.forEach((change, key) => {
                    switch (change.action) {
                        case 'add':
                        case 'update':
                            target[key] = toPlainValue(source.get(key))
                            break
                        case 'delete':
                            delete target[key]
                            break
                    }
                })
            } else if (event instanceof Y.YArrayEvent && isJSONArray(target)) {
                const arr = target as unknown as any[]

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

function applyPatch(source: Y.Map<any> | Y.Array<any>, patch: Patch) {
    const last = patch.path.pop()!

    const target = patch.path.reduce((obj, step) => {
        return obj.get(step as never)
    }, source)

    if (target instanceof Y.Map) {
        switch (patch.op) {
            case 'replace':
            case 'add':
                target.set(last as string, toYDataType(patch.value))
                break
            case 'remove':
                target.delete(last as string)
                break
        }
    } else if (target instanceof Y.Array && typeof last === 'number') {
        switch (patch.op) {
            case 'add':
                target.insert(last, [toYDataType(patch.value)])
                break
            case 'replace':
                target.delete(last)
                target.insert(last, [toYDataType(patch.value)])
                break
            case 'remove':
                target.delete(last)
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
