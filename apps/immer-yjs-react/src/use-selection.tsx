import { createContext, useCallback, useContext, useEffect, useState, useSyncExternalStore } from 'react'
import { Binder, Snapshot, bind } from 'immer-yjs'
import * as Y from 'yjs'

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

export type BinderContext =
    | {
          tag: 'loaded'
          binder: Binder<Snapshot>
      }
    | {
          tag: 'loading'
      }
    | {
          tag: 'failure'
      }
    | {
          tag: 'contextMissing'
      }

const fallbackSubscribe = () => () => undefined

export const useSelection2 = <Selection,>(selector: (state: DocumentState<Snapshot>) => Selection): Selection => {
    const binderContext = useContext(BinderContext)

    const subscribe = useCallback(binderContext.tag === 'loaded' ? binderContext.binder.subscribe : fallbackSubscribe, [
        binderContext,
    ])

    const getSnapshot = useCallback(() => {
        // TODO can cause infinite loop because reference to root is not kept
        switch (binderContext.tag) {
            case 'loading':
                return selector({
                    tag: 'loading',
                })
            case 'failure':
                return selector({
                    tag: 'error',
                })
            case 'contextMissing':
                return selector({
                    tag: 'contextMissing',
                })
            case 'loaded':
                return selector({
                    tag: 'loaded',
                    data: binderContext.binder.get(),
                })
        }
    }, [binderContext, selector])
    return useSyncExternalStore(subscribe, getSnapshot)
}

const BinderContext = createContext<BinderContext>({
    tag: 'contextMissing',
})

export const useImmerYjs = (
    effect: (doc: Y.Doc, onSync: () => void) => () => void,
    dependencies: unknown[]
): BinderContext => {
    const [binderContext, setBinderContext] = useState<BinderContext>({
        tag: 'loading',
    })

    useEffect(() => {
        const doc = new Y.Doc()
        const rootProp = doc.getMap('concept')
        const binder = bind(rootProp)

        const onSync = () => {
            setBinderContext({
                tag: 'loaded',
                binder,
            })
        }
        const cleanup = effect(doc, onSync)

        return cleanup
    }, dependencies)

    return binderContext
}

export const ImmerYjsProvider = BinderContext.Provider
