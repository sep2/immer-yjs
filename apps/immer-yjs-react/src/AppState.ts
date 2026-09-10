import { isNumber, isString, object, objectGuard, parseNumber, parseString, withDefault } from 'pure-parse'

export type AppState = {
    count: number
    text: string
}

export const parseAppState = withDefault(
    object<AppState>({
        count: parseNumber,
        text: parseString,
    }),
    {
        count: 0,
        text: '',
    }
)

export const isAppState = objectGuard<AppState>({
    count: isNumber,
    text: isString,
})
