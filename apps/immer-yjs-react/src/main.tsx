// Imported for its side effect and kept first: react-scan installs the React
// DevTools hook on load, which only instruments React if it runs before it.
// The scan itself is switched on and off by the useScan hook in App.
import 'react-scan'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './App'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>
)
