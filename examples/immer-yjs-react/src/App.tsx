import { ContextState } from './ContextState'
import { useScan } from 'react-scan'
import './App.css'

export const App = () => {
    useScan()

    return (
        <div className="stack">
            <h2>immer-yjs React Example</h2>
            <div className="stack">
                <h3>State from context</h3>
                <ContextState />
            </div>
        </div>
    )
}
