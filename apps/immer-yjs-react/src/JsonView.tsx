import { FunctionComponent, useMemo } from 'react'
import { JsonValue } from 'pure-parse'

export const JsonView: FunctionComponent<{
    value: JsonValue
}> = (props) => {
    const str = useMemo(() => JSON.stringify(props.value, null, 2), [props.value])
    return (
        <pre className="json-view">
            <code>{str}</code>
        </pre>
    )
}
