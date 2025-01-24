import { ContextState } from './ContextState'
import { useScan } from 'react-scan'
import { Stack } from './Stack'
import './App.css'

export const App = () => {
    useScan()

    return (
        <Stack>
            <h2>immer-yjs React Example</h2>
            <Stack flexDirection="row" gap={10}>
                <Stack gap={5}>
                    <h3>State from context</h3>
                    <ContextState />
                </Stack>
            </Stack>
        </Stack>
    )
}
