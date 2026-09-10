// react-scan must be imported before React to instrument it
import { scan } from 'react-scan'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './App'

// Opens the react-scan toolbar, which highlights every component as it
// re-renders and flags renders that changed nothing.
scan()

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>
)
