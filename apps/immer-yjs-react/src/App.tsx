import { useState } from 'react'
import { useScan } from 'react-scan'
import { DemoApp } from './DemoApp'
import './App.css'

export const App = () => {
    const [highlightRerenders, setHighlightRerenders] = useState(false)

    // Driving react-scan from state, rather than calling scan() once at startup,
    // is what lets it default to off and be toggled at any time.
    useScan({
        enabled: highlightRerenders,
        showToolbar: highlightRerenders,
    })

    return (
        <div className="stack">
            <h2>immer-yjs Example</h2>
            <p>
                A simple example with <code>immer-yjs</code> and <code>Y.js</code> libraries working together with
                React.
            </p>
            <p>
                The counter and text field below live in a Y.js document that is shared between peers with the
                <code>y-webrtc</code> provider.{' '}
                <a href="/" target="_blank" rel="noopener noreferrer">
                    Open this page in a new window
                </a>{' '}
                to show how both copies converge.
            </p>
            <label className="toggle">
                <input
                    type="checkbox"
                    checked={highlightRerenders}
                    onChange={(event) => setHighlightRerenders(event.target.checked)}
                />
                Highlight re-renders
            </label>
            <DemoApp />
            <h2>How it works</h2>
            <p>
                <code>immer-yjs</code> translates mutations into CRDT operations, and translates incoming remote
                operations back into immutable snapshots that components subscribe to.
            </p>
            <p>Here is how to update the document in code:</p>
            <pre className="code-block">
                <code>{'binder.update((state) => state.count++)'}</code>
            </pre>
            <p>
                Where <code>state</code> is an Immer document
            </p>
            <p>
                Because each snapshot is immutable, a <code>memo</code>-wrapped component only re-renders when the value
                it selected actually changed. Switch on <a href="https://github.com/aidenybai/react-scan">react-scan</a>{' '}
                and type in the text field: it outlines the field and the one JSON row that changed, and leaves the
                counter alone.
            </p>
        </div>
    )
}
