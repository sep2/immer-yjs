import { playwright } from '@vitest/browser-playwright'
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
