import { useState, useEffect, useRef } from 'react'
import api from '../api/client'
import theme from '../styles/theme'

export default function CreateEventSheet({ onClose, onSubmit, initialData }) {
  const [title, setTitle] = useState(initialData?.title || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [interest, setInterest] = useState(initialData?.interest || '')
  const [interestQuery, setInterestQuery] = useState(initialData?.interest || '')
  const [suggestions, setSuggestions] = useState([])
  const [startTime, setStartTime] = useState(initialData?.startTime ? toDatetimeLocal(new Date(initialData.startTime)) : '')
  const [endTime, setEndTime] = useState(initialData?.endTime ? toDatetimeLocal(new Date(initialData.endTime)) : '')
  const [chatMode, setChatMode] = useState(initialData?.chatMode || 'open')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const debounceRef = useRef(null)

  const isEdit = !!initialData?._id

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!interestQuery.trim()) { setSuggestions([]); return }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await api.get('/geo/interests', { params: { q: interestQuery.trim() } })
        setSuggestions(res.data.interests || [])
      } catch { setSuggestions([]) }
    }, 200)
  }, [interestQuery])

  function toDatetimeLocal(d) {
    const offset = d.getTimezoneOffset()
    const local = new Date(d.getTime() - offset * 60000)
    return local.toISOString().slice(0, 16)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!title.trim()) { setError('Title is required'); return }
    if (!startTime) { setError('Start time is required'); return }

    setSubmitting(true)
    try {
      if (isEdit) {
        await api.patch(`/events/${initialData._id}`, {
          title: title.trim(),
          description: description.trim(),
          interest: interest.trim() || undefined,
          startTime: new Date(startTime).toISOString(),
          endTime: endTime ? new Date(endTime).toISOString() : null,
          chatMode,
        })
      } else {
        await api.post('/events', {
          title: title.trim(),
          description: description.trim(),
          interest: interest.trim() || undefined,
          startTime: new Date(startTime).toISOString(),
          endTime: endTime ? new Date(endTime).toISOString() : null,
          lat: initialData?.lat,
          lng: initialData?.lng,
          chatMode,
        })
      }
      onSubmit?.()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save event')
    } finally {
      setSubmitting(false)
    }
  }

  function handleSelectSuggestion(s) {
    setInterest(s)
    setInterestQuery(s)
    setSuggestions([])
  }

  return (
    <>
      <div
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.4)', zIndex: 2000,
          animation: 'fadeIn 0.2s ease-out',
        }}
        onClick={onClose}
      />
      <div
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 2001,
          background: '#fff', borderRadius: '20px 20px 0 0',
          boxShadow: '0 -4px 24px rgba(0,0,0,0.15)',
          maxHeight: '85vh', overflowY: 'auto',
          animation: 'slideUp 0.3s ease-out',
          padding: '16px 20px calc(24px + env(safe-area-inset-bottom, 0px))',
        }}
      >
        <div style={{
          width: 36, height: 4, borderRadius: 2,
          background: '#ddd', margin: '0 auto 12px',
        }} />

        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 14, right: 16,
            border: 'none', background: '#f0f0f0', borderRadius: '50%',
            width: 32, height: 32, fontSize: 16, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#666', lineHeight: 1,
          }}
        >
          ✕
        </button>

        <h2 style={{ margin: '0 0 20px', fontSize: 18, color: '#333', textAlign: 'center' }}>
          {isEdit ? 'Edit Event' : 'Create Event'}
        </h2>

        {error && (
          <div style={{
            background: '#fff0f0', color: theme.error,
            padding: '10px 14px', borderRadius: 8,
            marginBottom: 12, fontSize: 13, textAlign: 'center',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            style={styles.input}
            placeholder="Event title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />

          <textarea
            style={{ ...styles.input, minHeight: 60, resize: 'none', fontFamily: 'inherit' }}
            placeholder="Description (optional)"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />

          <div style={{ position: 'relative', marginBottom: 12 }}>
            <input
              style={styles.input}
              placeholder="Interest tag (optional)"
              value={interestQuery}
              onChange={e => { setInterestQuery(e.target.value); setInterest(e.target.value) }}
            />
            {suggestions.length > 0 && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0,
                background: '#fff', borderRadius: 10,
                boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                overflow: 'hidden', zIndex: 10, marginTop: 4,
              }}>
                {suggestions.map(s => (
                  <div key={s}
                    style={{
                      padding: '10px 14px', cursor: 'pointer', fontSize: 13,
                      color: '#333', borderBottom: '1px solid #f0f0f0',
                    }}
                    onMouseDown={() => handleSelectSuggestion(s)}
                  >
                    {s}
                  </div>
                ))}
              </div>
            )}
          </div>

          <label style={styles.label}>Start time *</label>
          <input
            style={styles.input}
            type="datetime-local"
            value={startTime}
            onChange={e => setStartTime(e.target.value)}
            required
          />

          <label style={{ ...styles.label, marginTop: 8 }}>End time (optional)</label>
          <input
            style={styles.input}
            type="datetime-local"
            value={endTime}
            onChange={e => setEndTime(e.target.value)}
          />

          <div style={{
            fontSize: 12, color: '#888', marginBottom: 16, textAlign: 'center',
          }}>
            {'\u{1F4CD}'} Location: near your current position
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 0', marginBottom: 12,
            borderTop: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0',
          }}>
            <span style={{ fontSize: 13, color: '#555', fontWeight: 500 }}>
              Allow all members to message
            </span>
            <button
              type="button"
              onClick={() => setChatMode(chatMode === 'open' ? 'admin_only' : 'open')}
              style={{
                width: 44, height: 24, borderRadius: 12, border: 'none',
                cursor: 'pointer', position: 'relative',
                background: chatMode === 'open' ? theme.accent : '#ccc',
                transition: 'background 0.2s',
              }}
            >
              <div style={{
                width: 20, height: 20, borderRadius: '50%', background: '#fff',
                position: 'absolute', top: 2,
                left: chatMode === 'open' ? 22 : 2,
                transition: 'left 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              }} />
            </button>
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%', padding: '14px', border: 'none', borderRadius: 10,
              fontSize: 15, fontWeight: 600, color: '#fff',
              background: '#d97706', cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            {submitting ? 'Saving...' : isEdit ? 'Save changes' : 'Create event'}
          </button>
        </form>
      </div>
    </>
  )
}

const styles = {
  input: {
    width: '100%', padding: '12px 14px', marginBottom: 12,
    border: '1px solid #e0e0e0', borderRadius: 10,
    fontSize: 14, outline: 'none', boxSizing: 'border-box',
    color: '#333', fontFamily: 'inherit',
    background: '#fafafa',
  },
  label: {
    display: 'block', fontSize: 12, color: '#888',
    marginBottom: 4, fontWeight: 500,
  },
}
