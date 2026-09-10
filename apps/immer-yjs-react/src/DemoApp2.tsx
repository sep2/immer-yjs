import { bind, Binder, Snapshot } from 'immer-yjs'
import * as Y from 'yjs'
import { createContext, FunctionComponent, memo, useContext } from 'react'
import { AppState, isAppState } from './AppState'
import { DocumentState, ImmerYjsProvider, useImmerYjs, useSelection2 } from './use-selection'
import { WebrtcProvider } from 'y-webrtc'
import { isBoolean, object } from 'pure-parse'
import { JsonView } from './JsonView'

/**
 * Example with context
 */

const getMap = (doc: Y.Doc, key: string) => doc.getMap(key)

export type BinderContext =
    | {
          tag: 'initialized'
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

const BinderContext = createContext<BinderContext>({
    tag: 'initialized',
    binder: bind(getMap(new Y.Doc(), 'state')),
})

type WebrtcProviderStatus = {
    connected: boolean
}

const isWebrtcProviderStatus = object<WebrtcProviderStatus>({
    connected: isBoolean,
})

const selectData = (state: DocumentState) => (state.tag === 'loaded' && isAppState(state.data) ? state.data : undefined)
const selectIsInitialized = (state: DocumentState) => state.tag === 'loaded'
const selectCount = (state: DocumentState) => (state.tag === 'loaded' && isAppState(state.data) ? state.data.count : 0)

export const DemoApp2 = () => {
    const { binder } = useContext(BinderContext)

    const binderContext = useImmerYjs((ydoc, onSync) => {
        console.log('initia')
        const webrtcProvider = new WebrtcProvider('my-white-room', ydoc)
        webrtcProvider.on('status', (stat) => {
            if (isWebrtcProviderStatus(stat) && stat.connected) {
                onSync()
            }
        })
        return () => {
            webrtcProvider.destroy()
        }
    }, [])

    return (
        <ImmerYjsProvider value={binderContext}>
            <DemoAppWithContext />
        </ImmerYjsProvider>
    )
}

const DemoAppWithContext: FunctionComponent = () => {
    const isInitialized = useSelection2(selectIsInitialized)

    return (
        <div className="stack">
            {isInitialized ? <InitializedView /> : <UninitializedView />}
            <JsonState />
        </div>
    )
}

type A = {
    count: number
    text: string
}

interface B extends A {
    s: string
}

const b: B = {
    count: 0,
    text: '',
    s: '',
}

const UninitializedView: FunctionComponent = memo(() => {
    const { binder } = useContext(BinderContext)

    const handleInitialize = () =>
        binder.update(
            () =>
                ({
                    count: 0,
                    text: '',
                }) satisfies AppState
        )

    return <button onClick={handleInitialize}>Initialize</button>
})

const InitializedView: FunctionComponent = memo(() => {
    return (
        <div className="stack">
            <NewCounter />
        </div>
    )
})

const NewCounter: FunctionComponent = () => {
    const count = useSelection2(selectCount)
    return <div>Count: {count}</div>
}

export const JsonState = () => {
    const state = useSelection2(selectData)

    return state === undefined ? 'undefined' : <JsonView value={state} />
}
