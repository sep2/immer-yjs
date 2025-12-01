import { DemoApp } from './DemoApp'
import { useScan } from 'react-scan'
import './App.css'
import { DemoApp2 } from './DemoApp2'

export const App = () => {
    useScan()

    return (
        <div className="stack">
            <h2>immer-yjs React Example</h2>
            <div className="stack">
                <h3>State from context</h3>
                <DemoApp />
            </div>
            <hr />

            <h2>With Provider</h2>
            <p>This example uses WebrtcProvider</p>
            <div className="stack">
                <h3>State from context</h3>
                <DemoApp2 />
            </div>
        </div>
    )
}
