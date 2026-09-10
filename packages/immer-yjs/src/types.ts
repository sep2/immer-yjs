export type JSONPrimitive = string | number | boolean | null

export type JSONValue = JSONPrimitive | JSONObject | JSONArray

export type JSONObject = { [member: string]: JSONValue }

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface JSONArray extends Array<JSONValue> {}
