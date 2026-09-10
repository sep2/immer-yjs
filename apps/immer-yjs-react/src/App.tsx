import { DemoApp } from './DemoApp'
import './App.css'

export const App = () => (
    <div className="stack">
        <h2>immer-yjs React Example</h2>
        <p>
            The counter and text field below live in a Y.js document, but they are updated as if they were plain
            immutable state:
        </p>
        <pre className="code-block">
            <code>{'binder.update((state) => state.count++)'}</code>
        </pre>
        <p>
            immer-yjs translates those mutations into CRDT operations, and translates incoming remote operations back
            into immutable snapshots that components subscribe to.
        </p>
        <p>
            Here a <code>WebrtcProvider</code> shares the document with every peer in the room, so opening this page in
            a second window shows both copies converge—no reducers, no patches written by hand.
        </p>
        <p>
            Because each snapshot is immutable, a <code>memo</code>-wrapped component only re-renders when the value it
            selected actually changed. Type in the text field and watch{' '}
            <a href="https://github.com/aidenybai/react-scan">react-scan</a> highlight the text field alone—the counter
            beside it is left untouched.
        </p>
        <DemoApp />
    </div>
)
