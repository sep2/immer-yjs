import { bind, Binder, Snapshot } from 'immer-yjs'
import { useCallback, useEffect, useSyncExternalStore } from 'react'
import * as Y from 'yjs'

export const useBinder = <T extends Snapshot = Snapshot>(source: Y.Map<unknown> | Y.Array<unknown>): Binder<T> => {
    const binder = bind<T>(source)
    useEffect(() => {
        return binder.unbind
    }, [])
    return binder
}

export const createSelector =
    <T extends Snapshot>(store: Binder<T>) =>
    <Selection>(selector: (state: T) => Selection): Selection =>
        useSelection(store, selector)

export const useSelection = <T extends Snapshot, Selection>(
    binder: Binder<T>,
    selector: (state: T) => Selection
): Selection => {
    const getSnapshot = useCallback(() => selector(binder.get()), [binder, selector])
    return useSyncExternalStore(binder.subscribe, getSnapshot)
}
