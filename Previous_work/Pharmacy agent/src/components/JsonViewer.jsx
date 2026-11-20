import React from 'react'

export default function JsonViewer({ data, title }) {
  if (!data) return null

  const renderValue = (value, indent = 0) => {
    if (value === null) return <span className="json-null">null</span>
    if (typeof value === 'boolean') return <span className="json-boolean">{value.toString()}</span>
    if (typeof value === 'number') return <span className="json-number">{value}</span>
    if (typeof value === 'string') return <span className="json-string">"{value}"</span>

    if (Array.isArray(value)) {
      if (value.length === 0) return <span className="json-bracket">[]</span>
      return (
        <>
          <span className="json-bracket">[</span>
          {'\n'}
          {value.map((item, i) => (
            <span key={i}>
              {'  '.repeat(indent + 1)}
              {renderValue(item, indent + 1)}
              {i < value.length - 1 && <span className="json-comma">,</span>}
              {'\n'}
            </span>
          ))}
          {'  '.repeat(indent)}
          <span className="json-bracket">]</span>
        </>
      )
    }

    if (typeof value === 'object') {
      const keys = Object.keys(value)
      if (keys.length === 0) return <span className="json-bracket">{'{}'}</span>
      return (
        <>
          <span className="json-bracket">{'{'}</span>
          {'\n'}
          {keys.map((key, i) => (
            <span key={key}>
              {'  '.repeat(indent + 1)}
              <span className="json-key">"{key}"</span>
              <span className="json-comma">: </span>
              {renderValue(value[key], indent + 1)}
              {i < keys.length - 1 && <span className="json-comma">,</span>}
              {'\n'}
            </span>
          ))}
          {'  '.repeat(indent)}
          <span className="json-bracket">{'}'}</span>
        </>
      )
    }
    return String(value)
  }

  return (
    <div>
      {title && <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10 }}>{title}</h3>}
      <pre className="json-viewer">
        {renderValue(data)}
      </pre>
    </div>
  )
}
