import { bind } from 'immer-yjs'
import * as Y from 'yjs'
import { useSelection } from './immer-yjs-react'

/**
 * Shared
 */

type AppState = {
    tag: 'initialized'
    state: string
}

/**
 * Example with global store
 */

const docs = new Y.Doc()
const docProp = docs.getMap('state')
const binder = bind<AppState>(docProp)

export const AppWithGlobalStore = () => {
    const resetState = () => {
        binder.update(() => ({
            tag: 'initialized',
            state: 'Hello, world!',
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
    const state = useSelection(binder, (state) => state)

    switch (state.tag) {
        case 'initialized':
            return <div>{state.state}</div>
        default:
            return <div>Unexpected state: {JSON.stringify(state)}</div>
    }
}

export const JsonState = () => {
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
