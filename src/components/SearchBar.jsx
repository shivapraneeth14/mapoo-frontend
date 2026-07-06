import { useState, useEffect, useRef } from 'react'
import { IconSearch, IconX } from '@tabler/icons-react'
import api from '../api/client'

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
    <div style={{ flex: 1, position: 'relative', minWidth: 0 }}>
      <div className="search-bar">
        <IconSearch size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        <input
          type="text"
          placeholder="Search interest..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        {(query || activeFilter) && (
          <button
            onClick={() => { setQuery(''); setSuggestions([]); onClearFilter?.() }}
            style={{
              border: 'none', background: 'none', cursor: 'pointer',
              padding: 0, display: 'flex', color: 'var(--text-muted)', flexShrink: 0,
            }}
          >
            <IconX size={14} />
          </button>
        )}
      </div>

      {query.trim() && suggestions.length > 0 && (
        <div style={{
          position: 'absolute', top: 'calc(100% + var(--sp-2))',
          left: 0, right: 0,
          background: 'var(--bg)', boxShadow: 'var(--shadow-raised)',
          borderRadius: 'var(--radius-sm)',
          maxHeight: 240, overflowY: 'auto', zIndex: 10,
          animation: 'fadeIn var(--dur-fast) var(--ease-standard) forwards',
        }}>
          {suggestions.map(s => (
            <div
              key={s}
              onMouseDown={() => handleSelect(s)}
              style={{
                padding: 'var(--sp-3) var(--sp-4)',
                cursor: 'pointer', fontSize: 'var(--fs-base)',
                color: 'var(--text-primary)',
                transition: 'background var(--dur-fast)',
              }}
            >
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
