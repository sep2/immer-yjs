import { bind, Snapshot } from 'immer-yjs'
import * as Y from 'yjs'
import { createUseSelector, Store, useSelector, useStore } from './index.ts'
import { useContext, createContext } from 'react'

/**
 * Shared
 */

type AppState =
    | {
          tag: 'initialized'
          state: string
      }
    | {
          tag: 'loading'
      }
    | {
          tag: 'failure'
          message: string
      }

/**
 * Example with global store
 */

export const createGlobalStore = <T extends Snapshot>(source: Y.Map<unknown>): Store<T> => {
    const binder = bind<T>(source)
    return { binder }
}

const globalDoc = new Y.Doc()
const globalRootProp = globalDoc.getMap('state')
const globalStore = createGlobalStore<AppState>(globalRootProp)
const useAppSelector = createUseSelector(globalStore)

const AppWithGlobalStore = () => {
    const state = useAppSelector((state) => state)
    switch (state.tag) {
        case 'initialized':
            return <div>{state.state}</div>
        case 'loading':
            return <div>Loading...</div>
        case 'failure':
            return <div>Failed to load :(</div>
    }
}

/**
 * Example with context
 */

const ConceptsStoreContext = createContext<Store<AppState>>({
    binder: bind(new Y.Map()),
})

const AppWithContext = () => {
    const doc = new Y.Doc()
    const rootProp = doc.getMap('state')
    const store = useStore<AppState>(rootProp)
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
