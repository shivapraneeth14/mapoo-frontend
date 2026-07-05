import { useState } from 'react'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import theme from '../styles/theme'

export default function EventCard({ event, onClose, onJoin, onLeave, onEdit, onDelete, onOpenChat, onMemberRemoved }) {
  const { user } = useAuth()
  const [joining, setJoining] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [removingUserId, setRemovingUserId] = useState(null)

  if (!event) return null

  const isCreator = String(event.creator?._id || event.creator) === String(user?.id)
  const isAttendee = event.attendees?.some(a => String(a.user?._id || a.user) === String(user?.id))
  const startTime = event.startTime ? new Date(event.startTime) : null
  const endTime = event.endTime ? new Date(event.endTime) : null

  function formatTime(d) {
    return d.toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  function formatTimeRange(start, end) {
    if (!end) return formatTime(start)
    const sameDay = start.toDateString() === end.toDateString()
    if (sameDay) {
      return `${formatTime(start)} – ${end.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
    }
    return `${formatTime(start)} – ${formatTime(end)}`
  }

  async function handleJoin() {
    setJoining(true)
    try {
      const res = await api.post(`/events/${event._id}/join`)
      onJoin?.(res.data)
    } catch { /* */ } finally { setJoining(false) }
  }

  async function handleLeave() {
    setLeaving(true)
    try {
      await api.post(`/events/${event._id}/leave`)
      onLeave?.(event._id)
    } catch { /* */ } finally { setLeaving(false) }
  }

  async function handleDelete() {
    if (!window.confirm('Delete this event? Everyone will lose access to the chat.')) return
    setDeleting(true)
    try {
      await api.delete(`/events/${event._id}`)
      onDelete?.(event._id)
    } catch { /* */ } finally { setDeleting(false) }
  }

  async function handleRemoveMember(targetId) {
    if (!window.confirm('Remove this member from the event?')) return
    setRemovingUserId(targetId)
    try {
      const res = await api.post(`/events/${event._id}/removeMember`, { userId: targetId })
      onMemberRemoved?.(res.data.event)
    } catch { /* */ } finally { setRemovingUserId(null) }
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
          maxHeight: '80vh', overflowY: 'auto',
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

        <div style={{ textAlign: 'center', marginBottom: 12, marginTop: 8 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32,
            background: 'linear-gradient(145deg, #d97706, #f59e0b)',
            boxShadow: '0 2px 8px rgba(217,119,6,0.3)',
          }}>
            {'\u{1F4C5}'}
          </div>
          {isCreator && (
            <div style={{
              marginTop: 6, fontSize: 11, fontWeight: 600,
              color: theme.accent, background: '#eef2ff',
              padding: '2px 10px', borderRadius: 10,
              display: 'inline-block',
            }}>
              Host
            </div>
          )}
        </div>

        <h2 style={{
          margin: '0 0 4px', fontSize: 20, color: '#333',
          fontWeight: 600, textAlign: 'center',
        }}>
          {event.title}
        </h2>

        <div style={{
          textAlign: 'center', fontSize: 13, color: '#888',
          marginBottom: 4,
        }}>
          by {event.creator?.username || 'someone'}
          {event.creator?.hostedEventsCount > 0 && (
            <span> · {event.creator.hostedEventsCount} event{event.creator.hostedEventsCount > 1 ? 's' : ''} hosted</span>
          )}
        </div>

        {startTime && (
          <div style={{
            textAlign: 'center', fontSize: 13, color: '#555', fontWeight: 500,
            marginBottom: 12,
          }}>
            {formatTimeRange(startTime, endTime)}
          </div>
        )}

        {event.interest && (
          <div style={{ textAlign: 'center', marginBottom: 12 }}>
            <span style={{
              padding: '4px 12px', borderRadius: 16,
              fontSize: 12, background: '#f0f0f0', color: '#666',
              fontWeight: 500,
            }}>
              {event.interest}
            </span>
          </div>
        )}

        {event.description && (
          <p style={{
            margin: '0 0 16px', fontSize: 13, color: '#777',
            textAlign: 'center', lineHeight: 1.6, padding: '0 8px',
          }}>
            {event.description}
          </p>
        )}

        <div style={{
          borderTop: '1px solid #eee', padding: '12px 0 4px', marginBottom: 12,
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 8, textAlign: 'center' }}>
            Going ({event.attendeeCount || event.attendees?.length || 0})
            {event.chatMode === 'admin_only' && isCreator && (
              <span style={{ fontSize: 11, color: '#888', fontWeight: 400, marginLeft: 8 }}>
                · Admin-only chat
              </span>
            )}
          </div>
          {event.attendees?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
              {event.attendees.map(a => {
                const aId = String(a.user?._id || a.user)
                const isCreatorUser = aId === String(event.creator?._id || event.creator)
                return (
                  <div key={aId} style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    padding: '4px 10px', borderRadius: 16,
                    background: '#f5f5f5', fontSize: 12, color: '#555',
                  }}>
                    <span style={{ fontSize: 14 }}>{'\u{1F464}'}</span>
                    {a.user?.username || 'someone'}
                    {isCreatorUser && (
                      <span style={{ fontSize: 10, color: theme.accent, fontWeight: 600 }}> · Host</span>
                    )}
                    {isCreator && !isCreatorUser && (
                      <button
                        onClick={() => handleRemoveMember(aId)}
                        disabled={removingUserId === aId}
                        style={{
                          border: 'none', background: 'none', cursor: 'pointer',
                          fontSize: 13, color: '#d32f2f', padding: '0 0 0 4px',
                          lineHeight: 1,
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
          {isAttendee && !isCreator && (
            <button onClick={handleLeave} disabled={leaving}
              style={{
                width: '100%', padding: '12px', border: 'none', borderRadius: 10,
                fontSize: 14, fontWeight: 600, color: '#888',
                background: '#f0f0f0', cursor: 'pointer', fontFamily: 'inherit',
              }}>
              {leaving ? 'Leaving...' : 'Leave event'}
            </button>
          )}

          {isAttendee && (
            <button onClick={() => onOpenChat?.(event)}
              style={{
                width: '100%', padding: '12px', border: 'none', borderRadius: 10,
                fontSize: 14, fontWeight: 600, color: '#fff',
                background: theme.accent, cursor: 'pointer', fontFamily: 'inherit',
              }}>
              {'\u{1F4AC}'} Open group chat
            </button>
          )}

          {!isAttendee && (
            <button onClick={handleJoin} disabled={joining}
              style={{
                width: '100%', padding: '12px', border: 'none', borderRadius: 10,
                fontSize: 14, fontWeight: 600, color: '#fff',
                background: '#d97706', cursor: 'pointer', fontFamily: 'inherit',
              }}>
              {joining ? 'Joining...' : 'Join event'}
            </button>
          )}

          {isCreator && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => onEdit?.(event)}
                style={{
                  flex: 1, padding: '10px', border: 'none', borderRadius: 8,
                  fontSize: 13, color: '#888', background: '#f0f0f0',
                  cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500,
                }}>
                Edit
              </button>
              <button onClick={handleDelete} disabled={deleting}
                style={{
                  flex: 1, padding: '10px', border: 'none', borderRadius: 8,
                  fontSize: 13, color: '#d32f2f', background: '#fff0f0',
                  cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500,
                }}>
                {deleting ? '...' : 'Delete'}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
