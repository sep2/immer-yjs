import { FunctionComponent, memo } from 'react'
import { WebrtcProvider } from 'y-webrtc'
import { isBoolean, objectGuard } from 'pure-parse'
import { AppState, isAppState } from './AppState'
import { DocumentState, ImmerYjsProvider, useBinder, useImmerYjs, useSelection } from './immer-yjs-react'
import { JsonView } from './JsonView'

/**
 * Synchronizes an {@link AppState} document between every peer that joins the
 * same WebRTC room.
 */

const roomName = 'immer-yjs-react-example'

type WebrtcProviderStatus = {
    connected: boolean
}

const isWebrtcProviderStatus = objectGuard<WebrtcProviderStatus>({
    connected: isBoolean,
})

const createInitialState = (): AppState => ({
    count: 0,
    text: '',
})

const selectIsLoaded = (state: DocumentState) => state.tag === 'loaded'

/**
 * A `Y.Doc` carries no schema and this one is shared with untrusted peers, so a
 * synced document may hold anything. Narrow it before reading any field.
 *
 * This validates with a type guard rather than a parser on purpose: selector
 * results are compared with `Object.is` by `useSyncExternalStore`, and a parser
 * allocates a fresh result object on every call, which would re-render forever.
 * A guard returns the same reference, narrowed.
 */
const selectAppState = (state: DocumentState): AppState | undefined =>
    state.tag === 'loaded' && isAppState(state.data) ? state.data : undefined

const selectIsInitialized = (state: DocumentState) => selectAppState(state) !== undefined
const selectCount = (state: DocumentState) => selectAppState(state)?.count ?? 0
const selectText = (state: DocumentState) => selectAppState(state)?.text ?? ''

/** Deliberately unvalidated: the JSON pane shows whatever actually arrived. */
const selectRawDocument = (state: DocumentState) => (state.tag === 'loaded' ? state.data : undefined)

export const DemoApp = () => {
    const binderState = useImmerYjs((doc, onSync) => {
        const webrtcProvider = new WebrtcProvider(roomName, doc)

        webrtcProvider.on('status', (status) => {
            if (isWebrtcProviderStatus(status) && status.connected) {
                onSync()
            }
        })

        return () => {
            webrtcProvider.destroy()
        }
    }, [])

    return (
        <ImmerYjsProvider value={binderState}>
            <DocumentView />
        </ImmerYjsProvider>
    )
}

const DocumentView: FunctionComponent = () => {
    const isLoaded = useSelection(selectIsLoaded)
    const isInitialized = useSelection(selectIsInitialized)

    if (!isLoaded) {
        return <p>Connecting to peers…</p>
    }

    return (
        <div className="stack">
            {isInitialized ? <InitializedView /> : <UninitializedView />}
            <JsonState />
        </div>
    )
}

const UninitializedView: FunctionComponent = memo(() => {
    const binder = useBinder()

    // Returning a value from the recipe replaces the document wholesale.
    const initialize = () => binder?.update(() => createInitialState())

    return <button onClick={initialize}>Initialize</button>
})

const InitializedView: FunctionComponent = memo(() => (
    <div className="stack">
        <CounterView />
        <TextView />
        <ResetView />
    </div>
))

const ResetView: FunctionComponent = memo(() => {
    const binder = useBinder()

    const reset = () => binder?.update(() => createInitialState())

    return <button onClick={reset}>Reset</button>
})

const CounterView: FunctionComponent = memo(() => {
    const binder = useBinder()
    const count = useSelection(selectCount)

    const increment = () =>
        binder?.update((state) => {
            if (!isAppState(state)) {
                // If—for whatever reason—the state does not conform to the expected schema, we cannot update
                return
            }
            state.count++
        })

    return (
        <div className="row">
            <button onClick={increment}>Increment</button>
            <code className="count">{count}</code>
        </div>
    )
})

const TextView: FunctionComponent = memo(() => {
    const binder = useBinder()
    const text = useSelection(selectText)

    const updateText = (text: string) =>
        binder?.update((state) => {
            if (!isAppState(state)) {
                // If—for whatever reason—the state does not conform to the expected schema, we cannot update
                return
            }
            state.text = text
        })

    return <input type="text" value={text} placeholder="Type to sync…" onChange={(e) => updateText(e.target.value)} />
})

const JsonState: FunctionComponent = () => {
    const document = useSelection(selectRawDocument)

    if (document === undefined) {
        return null
    }

    return (
        <div className="stack">
            <small className="caption">The shared document, as it arrived from the provider</small>
            <JsonView value={document} />
        </div>
    )
}
