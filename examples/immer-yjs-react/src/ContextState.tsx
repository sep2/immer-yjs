import { bind, Binder } from 'immer-yjs'
import * as Y from 'yjs'
import { useBinder, useSelection } from './immer-yjs-react'
import { createContext, useContext } from 'react'
import { AppState } from './AppState'

/**
 * Example with context
 */

const getMap = (doc: Y.Doc, key: string) => doc.getMap(key)

const BinderContext = createContext<Binder<AppState>>(bind(getMap(new Y.Doc(), 'state')))

export const ContextState = () => {
    const doc = new Y.Doc()
    const rootProp = doc.getMap('state')
    const store = useBinder<AppState>(rootProp)
    return (
        <BinderContext.Provider value={store}>
            <AppWithContext />
        </BinderContext.Provider>
    )
}

const AppWithContext = () => {
    const binder = useContext(BinderContext)
    const resetState = () => {
        binder.update(() => ({
            tag: 'initialized',
            state: 'Hello, this state is contextual!',
        }))
    }
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
            }}
        >
            <button onClick={resetState}>Initialize/Reset</button>
            <State />
            <JsonState />
        </div>
    )
}

const State = () => {
    const binder = useContext(BinderContext)
    const state = useSelection(binder, (state) => state)

    switch (state.tag) {
        case 'initialized':
            return <div>{state.state}</div>
        default:
            return <div>Unexpected state: {JSON.stringify(state)}</div>
    }
}

export const JsonState = () => {
    const binder = useContext(BinderContext)
    const state = useSelection(binder, (state) => state)

    return (
        <pre
            style={{
                border: '1px solid grey',
                borderRadius: 5,
                padding: 10,
            }}
        >
            <code>{JSON.stringify(state, null, 2)}</code>
        </pre>
    )
}
