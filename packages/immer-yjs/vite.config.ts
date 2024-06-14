import * as path from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
    build: {
        lib: {
            entry: path.resolve(__dirname, 'src/index.ts'),
            name: 'immer-yjs',
            formats: ['es', 'umd'],
        },
        rollupOptions: {
            external: ['yjs', 'immer'],
            output: {
                globals: {
                    yjs: 'yjs',
                    immer: 'immer',
                },
                // Since we publish our ./src folder, there's no point
                // in bloating sourcemaps with another copy of it.
                sourcemapExcludeSources: true,
            },
        },
        sourcemap: true,
        // Reduce bloat from legacy polyfills.
        target: 'esnext',
        // Leave minification up to applications.
        minify: false,
    },
    plugins: [dts()],
})
