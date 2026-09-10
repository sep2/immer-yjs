import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
    build: {
        lib: {
            entry: fileURLToPath(new URL('src/index.ts', import.meta.url)),
            formats: ['es'],
        },
        rollupOptions: {
            external: ['yjs', 'immer'],
        },
        // We only publish ./dist, so sourcemaps would point at sources that
        // aren't there. Consumers who want to step through it can use ./src
        // from the repository.
        sourcemap: false,
        // Reduce bloat from legacy polyfills.
        target: 'esnext',
        // Leave minification up to applications.
        minify: false,
    },
    plugins: [
        dts({
            tsconfigPath: './tsconfig.lib.json',
            // Bundle the whole public API into a single declaration file. Keeps
            // relative imports out of the published types, which an ESM package
            // would otherwise have to spell with explicit file extensions.
            rollupTypes: true,
        }),
    ],
})
