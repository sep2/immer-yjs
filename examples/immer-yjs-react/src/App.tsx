import { GlobalState } from './GlobalState'
import { ContextState } from './ContextState'

export const App = () => {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
            }}
        >
            <h1>Examples</h1>
            <h2>Global state</h2>
            <GlobalState />
            <hr />
            <h2>State from context</h2>
            <ContextState />
        </div>
    )
}
