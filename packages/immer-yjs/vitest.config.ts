import { defineConfig } from 'vitest/config'

const include = ['src/**/*.test.ts']

export default defineConfig({
    test: {
        projects: [
            {
                test: {
                    name: 'node',
                    environment: 'node',
                    include,
                },
            },
            {
                test: {
                    name: 'happy-dom',
                    environment: 'happy-dom',
                    include,
                },
            },
        ],
    },
})
