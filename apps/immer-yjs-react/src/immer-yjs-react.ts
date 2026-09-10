import { createContext, useCallback, useContext, useEffect, useState, useSyncExternalStore } from 'react'
import { Binder, Snapshot, bind } from 'immer-yjs'
import * as Y from 'yjs'

/**
 * The state of a document that synchronizes over a network provider: the data
 * is not available until the provider has synced with a peer at least once.
 */
export type DocumentState<Data extends Snapshot = Snapshot> =
    | {
          tag: 'loaded'
          data: Data
      }
    | {
          tag: 'loading'
      }
    | {
          tag: 'error'
      }
    | {
          tag: 'contextMissing'
      }

/**
 * Same as {@link DocumentState}, but carries the binder that writes to the document.
 */
export type BinderState =
    | {
          tag: 'loaded'
          binder: Binder<Snapshot>
      }
    | {
          tag: 'loading'
      }
    | {
          tag: 'error'
      }
    | {
          tag: 'contextMissing'
      }

const BinderContext = createContext<BinderState>({
    tag: 'contextMissing',
})

export const ImmerYjsProvider = BinderContext.Provider

/**
 * Subscribe to a projection of the document state.
 *
 * The selector must be referentially stable—declare it at module level—and it
 * must not allocate a new object on every call: `useSyncExternalStore` compares
 * results with `Object.is`, so returning a fresh object each time re-renders
 * forever. Project out primitives, or return the `data` reference as-is.
 */
export const useSelection = <Selection>(selector: (state: DocumentState) => Selection): Selection => {
    const binderState = useContext(BinderContext)

    const subscribe = useCallback(
        (onStoreChange: () => void) =>
            binderState.tag === 'loaded' ? binderState.binder.subscribe(onStoreChange) : () => undefined,
        [binderState]
    )

    const getSnapshot = useCallback(() => {
        switch (binderState.tag) {
            case 'loading':
                return selector({ tag: 'loading' })
            case 'error':
                return selector({ tag: 'error' })
            case 'contextMissing':
                return selector({ tag: 'contextMissing' })
            case 'loaded':
                return selector({ tag: 'loaded', data: binderState.binder.get() })
        }
    }, [binderState, selector])

    return useSyncExternalStore(subscribe, getSnapshot)
}

/**
 * The binder that writes to the document, or `undefined` while the document is
 * unavailable.
 */
export const useBinder = (): Binder<Snapshot> | undefined => {
    const binderState = useContext(BinderContext)
    return binderState.tag === 'loaded' ? binderState.binder : undefined
}

/**
 * Create a `Y.Doc`, let `connect` attach a network provider to it, and bind the
 * document once that provider reports it has synced. Pass the result to
 * {@link ImmerYjsProvider}.
 *
 * `connect` returns a teardown function, and is re-run whenever `dependencies`
 * change.
 */
export const useImmerYjs = (
    connect: (doc: Y.Doc, onSync: () => void) => () => void,
    dependencies: unknown[]
): BinderState => {
    const [binderState, setBinderState] = useState<BinderState>({
        tag: 'loading',
    })

    useEffect(() => {
        const doc = new Y.Doc()
        const binder = bind(doc.getMap('state'))

        const disconnect = connect(doc, () =>
            setBinderState({
                tag: 'loaded',
                binder,
            })
        )

        return () => {
            disconnect()
            binder.unbind()
            doc.destroy()
            setBinderState({ tag: 'loading' })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, dependencies)

    return binderState
}
