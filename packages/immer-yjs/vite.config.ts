import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import dts from 'unplugin-dts/vite'

export default defineConfig({
    plugins: [
        dts({
            tsconfigPath: './tsconfig.lib.json',
            // Merge the public API into a single declaration file, so the published
            // types carry no relative specifiers. An ESM package would otherwise have
            // to spell those with explicit file extensions.
            // Needs the @rushstack/node-core-library patch to work under
            // Yarn PnP -- see .yarn/patches.
            bundleTypes: true,
        }),
    ],
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
