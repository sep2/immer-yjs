import { FunctionComponent, memo } from 'react'
import { JsonValue } from 'pure-parse'

/**
 * Renders a JSON value as an indented tree in which every node is memoized.
 *
 * immer-yjs snapshots are immutable and structurally shared: an update rebuilds
 * only the path from the root down to the value that changed, so every untouched
 * subtree keeps its reference and `memo` skips re-rendering it. Stringifying the
 * whole document would instead rebuild every line on every keystroke.
 *
 * Each component below is a *named* function expression rather than an arrow, so
 * that react-scan labels the nodes it highlights with their real names.
 */
export const JsonView: FunctionComponent<{
    value: JsonValue
}> = memo(function JsonView(props) {
    return (
        <div className="json-view">
            <JsonNode value={props.value} />
        </div>
    )
})

const JsonNode: FunctionComponent<{
    value: JsonValue
}> = memo(function JsonNode(props) {
    const { value } = props

    if (value === null || typeof value !== 'object') {
        return <JsonPrimitive value={value} />
    }

    return Array.isArray(value) ? <JsonArrayNode value={value} /> : <JsonObjectNode value={value} />
})

const JsonObjectNode: FunctionComponent<{
    value: { [key: string]: JsonValue }
}> = memo(function JsonObjectNode(props) {
    const entries = Object.entries(props.value)

    // Not required, but nicer formatting
    if (entries.length === 0) {
        return <span className="json-punctuation">{'{}'}</span>
    }

    return (
        <>
            <span className="json-punctuation">{'{'}</span>
            <div className="json-indent">
                {entries.map(([name, value], index) => (
                    <JsonProperty key={name} name={name} value={value} isLast={index === entries.length - 1} />
                ))}
            </div>
            <span className="json-punctuation">{'}'}</span>
        </>
    )
})

const JsonProperty: FunctionComponent<{
    name: string
    value: JsonValue
    isLast: boolean
}> = memo(function JsonProperty(props) {
    return (
        <div>
            <span className="json-key">"{props.name}"</span>
            <span className="json-punctuation">: </span>
            <JsonNode value={props.value} />
            {!props.isLast && <span className="json-punctuation">,</span>}
        </div>
    )
})

const JsonArrayNode: FunctionComponent<{
    value: JsonValue[]
}> = memo(function JsonArrayNode(props) {
    const { value } = props

    if (value.length === 0) {
        return <span className="json-punctuation">[]</span>
    }

    return (
        <>
            <span className="json-punctuation">[</span>
            <div className="json-indent">
                {value.map((item, index) => (
                    // A JSON array carries no stable identity, so the index is the only key available
                    <JsonItem key={index} value={item} isLast={index === value.length - 1} />
                ))}
            </div>
            <span className="json-punctuation">]</span>
        </>
    )
})

const JsonItem: FunctionComponent<{
    value: JsonValue
    isLast: boolean
}> = memo(function JsonItem(props) {
    return (
        <div>
            <JsonNode value={props.value} />
            {!props.isLast && <span className="json-punctuation">,</span>}
        </div>
    )
})

const JsonPrimitive: FunctionComponent<{
    value: null | boolean | number | string
}> = memo(function JsonPrimitive(props) {
    const { value } = props

    if (typeof value === 'string') {
        return <span className="json-string">"{value}"</span>
    }

    return <span className={typeof value === 'number' ? 'json-number' : 'json-keyword'}>{String(value)}</span>
})
