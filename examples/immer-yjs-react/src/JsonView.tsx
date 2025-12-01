import { FunctionComponent, useMemo } from 'react'
import { JsonValue } from 'pure-parse'

export const JsonView: FunctionComponent<{
    value: JsonValue
}> = (props) => {
    const str = useMemo(() => JSON.stringify(props.value, null, 2), [props.children])
    return (
        <pre
            style={{
                border: '1px solid grey',
                borderRadius: 5,
                padding: 10,
                textAlign: 'left',
            }}
        >
            <code>{str}</code>
        </pre>
    )
}
