import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config({ ignores: ['dist'] }, js.configs.recommended, tseslint.configs.recommended, {
    linterOptions:{
        reportUnusedDisableDirectives: true
    },
    languageOptions: {
        globals: {
            ...globals.browser,
            ...globals.node,
        },
    },
})
