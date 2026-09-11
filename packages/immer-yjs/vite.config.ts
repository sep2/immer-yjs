import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

export default defineConfig({
    build: {
        lib: {
            entry: fileURLToPath(new URL('src/index.ts', import.meta.url)),
            formats: ['es'],
        },
        rollupOptions: {
            external: ['yjs', 'immer'],
        },
        sourcemap: true,
        target: 'esnext',
        // Leave minification up to applications.
        minify: false,
    },
})
