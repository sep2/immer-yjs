import { bind } from 'immer-yjs'
import * as Y from 'yjs'
import { createSelector, useSelector, useBinder } from './index.ts'
import { useContext, createContext } from 'react'

/**
 * Example with context
 */

const ConceptsStoreContext = createContext<AppState>({
    binder: bind(new Y.Map()),
})

const AppWithContext = () => {
    const doc = new Y.Doc()
    const rootProp = doc.getMap('state')
    const store = useBinder<AppState>(rootProp)
    return (
        <ConceptsStoreContext.Provider value={store}>
            <Child />
        </ConceptsStoreContext.Provider>
    )
}

const Child = () => {
    const store = useContext(ConceptsStoreContext)
    const state = useSelector(store, (state) => state)
    switch (state.tag) {
        case 'initialized':
            return <div>{state.state}</div>
        case 'loading':
            return <div>Loading...</div>
        case 'failure':
            return <div>Failed to load :(</div>
    }
}

export const Examples = () => {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
            }}
        >
            <h1>Examples</h1>
            <h2>AppWithGlobalStore</h2>
            <AppWithGlobalStore />
            <h2>AppWithContext</h2>
            <AppWithContext />
        </div>
    )
}
