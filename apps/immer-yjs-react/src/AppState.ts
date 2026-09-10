import { isNumber, isString, objectGuard } from 'pure-parse'

export type AppState = {
    count: number
    text: string
}

export const isAppState = objectGuard<AppState>({
    count: isNumber,
    text: isString,
})
