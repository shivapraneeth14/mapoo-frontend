import { useState, useEffect, useRef } from 'react'
import { IconMapPin, IconCrosshair, IconMap } from '@tabler/icons-react'
import api from '../api/client'

export default function CreateEventSheet({ onClose, onSubmit, initialData, selectedLocation, onPickLocation, pickingLocation, onCancelPickLocation, onLocationConfirmed }) {
  const [title, setTitle] = useState(initialData?.title || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [interest, setInterest] = useState(initialData?.interest || '')
  const [interestQuery, setInterestQuery] = useState(initialData?.interest || '')
  const [suggestions, setSuggestions] = useState([])
  const [startTime, setStartTime] = useState(initialData?.startTime ? toDatetimeLocal(new Date(initialData.startTime)) : '')
  const [endTime, setEndTime] = useState(initialData?.endTime ? toDatetimeLocal(new Date(initialData.endTime)) : '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const debounceRef = useRef(null)

  const isEdit = !!initialData?._id
  const hasPickedLocation = selectedLocation !== null

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
      const payload = {
        title: title.trim(),
        description: description.trim(),
        interest: interest.trim() || undefined,
        startTime: new Date(startTime).toISOString(),
        endTime: endTime ? new Date(endTime).toISOString() : null,
      }
      if (hasPickedLocation) {
        payload.lat = selectedLocation.lat
        payload.lng = selectedLocation.lng
      } else {
        payload.lat = initialData?.lat
        payload.lng = initialData?.lng
      }
      if (isEdit) {
        await api.patch(`/events/${initialData._id}`, payload)
      } else {
        await api.post('/events', payload)
      }
      onSubmit?.()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save event')
    } finally { setSubmitting(false) }
  }

  function handleSelectSuggestion(s) { setInterest(s); setInterestQuery(s); setSuggestions([]) }

  if (pickingLocation) {
    return (
      <div className="sheet-picking-bar" style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: 'var(--bg)', padding: 'var(--sp-4)',
          boxShadow: '0 -2px 12px rgba(0,0,0,0.1)',
          zIndex: 1000, textAlign: 'center',
          borderTopLeftRadius: 'var(--radius-lg)',
          borderTopRightRadius: 'var(--radius-lg)',
        }}>
          <div style={{ fontSize: 'var(--fs-base)', color: 'var(--text-primary)', marginBottom: 'var(--sp-3)' }}>
            Tap on the map to set event location
          </div>
          <button
            onClick={onCancelPickLocation}
            style={{
              padding: 'var(--sp-2) var(--sp-6)', fontSize: 'var(--fs-sm)',
              borderRadius: 'var(--radius-pill)', border: '1px solid var(--text-muted)',
              background: 'var(--bg)', color: 'var(--text-secondary)',
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Cancel
          </button>
        </div>
    )
  }

  return (
    <>
      <div className="sheet-backdrop" onClick={onClose} />
      <div className="sheet-base" style={{ maxHeight: '85vh' }}>
        <div className="sheet-handle" />
        <h2 className="sheet-title">{isEdit ? 'Edit event' : 'Create event'}</h2>

        {error && (
          <div style={{ color: 'var(--semantic-danger)', fontSize: 'var(--fs-sm)', textAlign: 'center', background: 'var(--semantic-danger-bg)', padding: 'var(--sp-3) var(--sp-4)', borderRadius: 'var(--radius-sm)', marginBottom: 'var(--sp-3)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="field-group">
            <label>Title</label>
            <input className="input-field" placeholder="Event title" value={title} onChange={e => setTitle(e.target.value)} required />
          </div>

          <div className="field-group">
            <label>Description</label>
            <textarea className="input-field" placeholder="Describe your event (optional)" value={description} onChange={e => setDescription(e.target.value)} />
          </div>

          <div className="time-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-3)' }}>
            <div className="field-group">
              <label>Start time</label>
              <input className="input-field" type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} required />
            </div>
            <div className="field-group">
              <label>End time</label>
              <input className="input-field" type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)} />
            </div>
          </div>

          <div className="field-group">
            <label>Location</label>
            <div style={{ display: 'flex', gap: 'var(--sp-2)', marginBottom: 'var(--sp-2)' }}>
              <button type="button" onClick={() => onLocationConfirmed?.(null)}
                style={{
                  flex: 1, padding: 'var(--sp-3)', borderRadius: 'var(--radius-sm)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--sp-2)',
                  fontSize: 'var(--fs-sm)', fontFamily: 'inherit', cursor: 'pointer',
                  border: !hasPickedLocation ? '2px solid var(--primary)' : '1px solid var(--text-muted)',
                  background: !hasPickedLocation ? 'var(--bg)' : 'transparent',
                  color: !hasPickedLocation ? 'var(--primary)' : 'var(--text-secondary)',
                  fontWeight: !hasPickedLocation ? 'var(--fw-medium)' : 'var(--fw-regular)',
                  transition: 'all var(--dur-fast) var(--ease-standard)',
                }}
              >
                <IconCrosshair size={16} />
                Current location
              </button>
              <button type="button" onClick={onPickLocation}
                style={{
                  flex: 1, padding: 'var(--sp-3)', borderRadius: 'var(--radius-sm)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--sp-2)',
                  fontSize: 'var(--fs-sm)', fontFamily: 'inherit', cursor: 'pointer',
                  border: hasPickedLocation ? '2px solid var(--primary)' : '1px solid var(--text-muted)',
                  background: hasPickedLocation ? 'var(--bg)' : 'transparent',
                  color: hasPickedLocation ? 'var(--primary)' : 'var(--text-secondary)',
                  fontWeight: hasPickedLocation ? 'var(--fw-medium)' : 'var(--fw-regular)',
                  transition: 'all var(--dur-fast) var(--ease-standard)',
                }}
              >
                <IconMap size={16} />
                {hasPickedLocation ? 'Change location' : 'Choose on map'}
              </button>
            </div>
            <div style={{
              padding: 'var(--sp-3)', borderRadius: 'var(--radius-sm)',
              background: 'var(--bg)', boxShadow: 'var(--shadow-pressed)',
              display: 'flex', alignItems: 'center', gap: 'var(--sp-2)',
              fontSize: 'var(--fs-sm)', color: 'var(--text-muted)',
            }}>
              <IconMapPin size={16} />
              <span>{hasPickedLocation
                ? `Selected location (${selectedLocation.lat.toFixed(4)}, ${selectedLocation.lng.toFixed(4)})`
                : 'Using current location'}</span>
            </div>
          </div>

          <div className="field-group" style={{ position: 'relative' }}>
            <label>Tag</label>
            <input className="input-field" placeholder="e.g., pickup game, interview" value={interestQuery} onChange={e => { setInterestQuery(e.target.value); setInterest(e.target.value) }} />
            {suggestions.length > 0 && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0,
                background: 'var(--bg)', boxShadow: 'var(--shadow-raised)',
                borderRadius: 'var(--radius-sm)', overflow: 'hidden', zIndex: 10, marginTop: 4,
              }}>
                {suggestions.map(s => (
                  <div key={s} style={{ padding: 'var(--sp-3) var(--sp-4)', cursor: 'pointer', fontSize: 'var(--fs-sm)', color: 'var(--text-primary)' }}
                    onMouseDown={() => handleSelectSuggestion(s)}>
                    {s}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button className="btn btn-primary btn-full" type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : isEdit ? 'Save changes' : 'Post event'}
          </button>
        </form>
      </div>
    </>
  )
}
