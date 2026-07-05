import { useState, useEffect, useRef } from 'react'
import api from '../api/client'
import theme from '../styles/theme'

export default function SearchBar({ onSearch, activeFilter, onClearFilter }) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const debounceRef = useRef(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!query.trim()) { setSuggestions([]); return }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await api.get('/geo/interests', { params: { q: query.trim() } })
        setSuggestions(res.data.interests || [])
      } catch { setSuggestions([]) }
    }, 200)
  }, [query])

  function handleSelect(interest) {
    onSearch(interest)
    setQuery('')
    setSuggestions([])
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      const val = query.trim()
      if (val) handleSelect(val)
    }
  }

  return (
    <div className="map-search" style={{}}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        background: theme.bg,
        borderRadius: theme.radius.lg,
        padding: '0 16px',
        boxShadow: theme.shadow.raised,
      }}>
        <span style={{ fontSize: 16, marginRight: 10, opacity: 0.5 }}>🔍</span>
        <input
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            padding: '14px 0',
            fontSize: theme.fontSize.md,
            color: theme.text,
            fontFamily: 'inherit',
          }}
          type="text"
          placeholder="Search interest..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        {query && (
          <button
            style={{
              border: 'none', background: 'none', cursor: 'pointer',
              fontSize: 14, color: theme.textMuted, padding: '4px 8px',
            }}
            onClick={() => { setQuery(''); setSuggestions([]) }}
          >
            ✕
          </button>
        )}
      </div>

      {query.trim() && suggestions.length > 0 && (
        <div style={{
          marginTop: 8,
          background: theme.bg,
          borderRadius: theme.radius.lg,
          boxShadow: theme.shadow.cardSm,
          overflow: 'hidden',
          maxHeight: 320,
          overflowY: 'auto',
        }}>
          {suggestions.map(s => (
            <div
              key={s}
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                fontSize: theme.fontSize.md,
                color: theme.text,
                fontWeight: 500,
                borderBottom: '1px solid rgba(0,0,0,0.04)',
                transition: 'background 0.15s',
              }}
              onMouseDown={() => handleSelect(s)}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.04)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {s}
            </div>
          ))}
        </div>
      )}

      {activeFilter && (
        <div style={{
          marginTop: 8,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 12px',
          borderRadius: theme.radius.md,
          background: theme.accent,
          color: '#fff',
          fontSize: theme.fontSize.sm,
          fontWeight: 500,
        }}>
          {activeFilter}
          <button
            style={{
              border: 'none', background: 'none', cursor: 'pointer',
              color: '#fff', fontSize: 14, padding: 0, lineHeight: 1,
              opacity: 0.8,
            }}
            onClick={onClearFilter}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  )
}
