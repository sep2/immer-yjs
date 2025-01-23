import { bind, Binder, Snapshot } from 'immer-yjs'
import * as Y from 'yjs'
import { useEffect, useCallback, useSyncExternalStore } from 'react'

export const useStore = <T extends Snapshot>(source: Y.Map<unknown> | Y.Array<unknown>): Store<T> => {
    const binder = bind<T>(source)
    useEffect(() => {
        return binder.unbind
    }, [])
    return { binder }
}

export type Store<T extends Snapshot> = {
    binder: Binder<T>
}

export const createUseSelector =
    <T extends Snapshot>(store: Store<T>) =>
    <Selection>(selector: (state: T) => Selection): Selection =>
        useSelector(store, selector)

export const useSelector = <T extends Snapshot, Selection>(
    store: Store<T>,
    selector: (state: T) => Selection
): Selection => {
    const getSnapshot = useCallback(() => selector(store.binder.get()), [store, selector])
    return useSyncExternalStore(store.binder.subscribe, getSnapshot)
}

// const useAppState = createUseState<ConceptState>(
