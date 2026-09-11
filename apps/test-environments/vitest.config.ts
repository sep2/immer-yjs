import { playwright } from '@vitest/browser-playwright'
import { defineConfig } from 'vitest/config'

const include = ['src/**/*.test.ts']

// One suite (src/smoke.test.ts), run once per environment a consumer might use.
// The suite imports `immer-yjs` by package name, so each project exercises the
// published `exports` map rather than the source.
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
                    name: 'chromium',
                    include,
                    browser: {
                        enabled: true,
                        provider: playwright(),
                        headless: true,
                        instances: [{ browser: 'chromium' }],
                    },
                },
            },
        ],
    },
})
