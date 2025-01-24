import { Binder, Snapshot } from 'immer-yjs'
import { useCallback, useSyncExternalStore } from 'react'

export const useSelection = <T extends Snapshot, Selection>(
    binder: Binder<T>,
    selector: (state: T) => Selection
): Selection => {
    const getSnapshot = useCallback(() => selector(binder.get()), [binder, selector])
    return useSyncExternalStore(binder.subscribe, getSnapshot)
}
