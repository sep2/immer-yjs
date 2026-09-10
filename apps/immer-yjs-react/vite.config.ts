import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    build: {
        // This example bundles react-scan to visualize re-renders, which alone
        // exceeds the default 500 kB warning threshold.
        chunkSizeWarningLimit: 800,
    },
})
