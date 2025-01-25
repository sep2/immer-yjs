import { bind, Binder, Snapshot } from 'immer-yjs'
import * as Y from 'yjs'
import { useSelection } from './immer-yjs-react'
import { createContext, FunctionComponent, memo, useContext } from 'react'
import { AppState, isAppState, parseAppState } from './AppState'

/**
 * Example with context
 */

const getMap = (doc: Y.Doc, key: string) => doc.getMap(key)

const BinderContext = createContext<Binder<Snapshot>>(bind(getMap(new Y.Doc(), 'state')))

export const ContextState = () => {
    const binder = useContext(BinderContext)
    const isInitialized = useSelection(binder, (state) => isAppState(state))

    return (
        <div className="stack">
            {isInitialized ? <InitializedView /> : <UninitializedView />}
            <JsonState />
        </div>
    )
}

const UninitializedView: FunctionComponent = memo(() => {
    const binder = useContext(BinderContext)

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
            <CounterView />
            <TextView />
        </div>
    )
})

const CounterView: FunctionComponent = memo(() => {
    const binder = useContext(BinderContext)
    const count = useSelection(binder, (state) => parseAppState(state).value.count)
    const increment = () => {
        binder.update((state) => {
            if (!isAppState(state)) {
                // If for—whatever reason—the state does not conform to the expected schema, we cannot update
                return
            }
            state.count++
        })
    }
    return (
        <div>
            <button onClick={increment}>Increment</button>
            <code>{count}</code>
        </div>
    )
})

const TextView: FunctionComponent = memo(() => {
    const binder = useContext(BinderContext)
    const text = useSelection(binder, (state) => parseAppState(state).value.text)
    const updateText = (text: string) => {
        binder.update((state) => {
            if (!isAppState(state)) {
                // If for—whatever reason—the state does not conform to the expected schema, we cannot update
                return
            }
            state.text = text
        })
    }
    return <input type="text" value={text} onChange={(e) => updateText(e.target.value)} />
})

export const JsonState = () => {
    const binder = useContext(BinderContext)
    const state = useSelection(binder, (state) => state)

    return (
        <pre
            style={{
                border: '1px solid grey',
                borderRadius: 5,
                padding: 10,
                textAlign: 'left',
            }}
        >
            <code>{JSON.stringify(state, null, 2)}</code>
        </pre>
    )
}
