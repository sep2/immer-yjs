import { FunctionComponent, ReactNode } from 'react'

export const Stack: FunctionComponent<{
    gap?: number
    flexDirection?: 'row' | 'column'
    children: ReactNode
}> = ({ gap, flexDirection, children }) => (
    <div
        style={{
            display: 'flex',
            flexDirection: flexDirection ?? 'column',
            alignItems: 'stretch',
            gap: gap ?? 0,
        }}
    >
        {children}
    </div>
)
