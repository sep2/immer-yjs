import produce, { enablePatches, Patch, produceWithPatches } from 'immer'
import * as Y from 'yjs'

import { JSONArray, JSONObject, JSONValue } from './types'
import { isJSONArray, isJSONObject, notImplemented, toPlainValue, toYDataType } from './util'

enablePatches()

export type Snapshot = JSONObject | JSONArray

function applyYEvent<T extends JSONValue>(base: T, event: Y.YEvent<any>) {
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
    }
}

function applyYEvents<S extends Snapshot>(snapshot: S, events: Y.YEvent<any>[]) {
    return produce(snapshot, (target) => {
        for (const event of events) {
            const base = event.path.reduce((obj, step) => {
                // @ts-ignore
                return obj[step]
            }, target)

            applyYEvent(base, event)
        }
    })
}

const PATCH_REPLACE = 'replace'
const PATCH_ADD = 'add'
const PATCH_REMOVE = 'remove'

function defaultApplyPatch(target: Y.Map<any> | Y.Array<any>, patch: Patch) {
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
            target.push(value.map(toYDataType))
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
    } else if (base instanceof Y.Array && property === 'length') {
        if (value < base.length) {
            const diff = base.length - value
            base.delete(value, diff)
        }
    } else {
        notImplemented()
    }
}

export type UpdateFn<S extends Snapshot> = (draft: S) => void

function applyUpdate<S extends Snapshot>(
    source: Y.Map<any> | Y.Array<any>,
    snapshot: S,
    fn: UpdateFn<S>,
    applyPatch: typeof defaultApplyPatch
) {
    const [, patches] = produceWithPatches(snapshot, fn)
    for (const patch of patches) {
        applyPatch(source, patch)
    }
}

export type ListenerFn<S extends Snapshot> = (snapshot: S) => void
export type UnsubscribeFn = () => void

export type Binder<S extends Snapshot> = {
    /**
     * Release the binder.
     */
    unbind: () => void

    /**
     * Return the latest snapshot.
     */
    get: () => S

    /**
     * Update the snapshot as well as the corresponding y.js data.
     * Same usage as `produce` from `immer`.
     */
    update: (fn: UpdateFn<S>) => void

    /**
     * Subscribe to snapshot update, fired when:
     *   1. User called update(fn).
     *   2. y.js source.observeDeep() fired.
     */
    subscribe: (fn: ListenerFn<S>) => UnsubscribeFn
}

export type Options<S extends Snapshot> = {
    /**
     * Customize immer patch application.
     * Should apply patch to the target y.js data.
     * @param target The y.js data to be modified.
     * @param patch The patch that should be applied, please refer to 'immer' patch documentation.
     * @param applyPatch the default behavior to apply patch, call this to handle the normal case.
     */
    applyPatch?: (target: Y.Map<any> | Y.Array<any>, patch: Patch, applyPatch: typeof defaultApplyPatch) => void
}

/**
 * Bind y.js data type.
 * @param source The y.js data type to bind.
 * @param options Change default behavior, can be omitted.
 */
export function bind<S extends Snapshot>(source: Y.Map<any> | Y.Array<any>, options?: Options<S>): Binder<S> {
    let snapshot = source.toJSON() as S

    const get = () => snapshot

    const subscription = new Set<ListenerFn<S>>()

    const subscribe = (fn: ListenerFn<S>) => {
        subscription.add(fn)
        return () => void subscription.delete(fn)
    }

    const observer = (events: Y.YEvent<any>[]) => {
        snapshot = applyYEvents(get(), events)
        subscription.forEach((fn) => fn(get()))
    }

    source.observeDeep(observer)
    const unbind = () => source.unobserveDeep(observer)

    const applyPatchInOption = options ? options.applyPatch : undefined

    const applyPatch = applyPatchInOption
        ? (target: Y.Map<any> | Y.Array<any>, patch: Patch) => applyPatchInOption(target, patch, defaultApplyPatch)
        : defaultApplyPatch

    const update = (fn: UpdateFn<S>) => {
        const doc = source.doc

        const doApplyUpdate = () => {
            applyUpdate(source, get(), fn, applyPatch)
        }

        if (doc) {
            Y.transact(doc, doApplyUpdate)
        } else {
            doApplyUpdate()
        }
    }

    return {
        unbind,
        get,
        update,
        subscribe,
    }
}
