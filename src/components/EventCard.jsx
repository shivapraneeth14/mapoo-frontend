import { useState } from 'react'
import { IconCalendarEvent, IconUsers, IconMessageCircle, IconFlag } from '@tabler/icons-react'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import { getIcon } from '../components/AvatarIcon'

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
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  function formatTimeRange(start, end) {
    if (!end) return formatTime(start)
    const sameDay = start.toDateString() === end.toDateString()
    if (sameDay) return `${formatTime(start)} – ${end.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
    return `${formatTime(start)} – ${formatTime(end)}`
  }

  async function handleJoin() { setJoining(true); try { const res = await api.post(`/events/${event._id}/join`); onJoin?.(res.data) } catch { /* */ } finally { setJoining(false) } }
  async function handleLeave() { setLeaving(true); try { await api.post(`/events/${event._id}/leave`); onLeave?.(event._id) } catch { /* */ } finally { setLeaving(false) } }
  async function handleDelete() { if (!window.confirm('Delete this event?')) return; setDeleting(true); try { await api.delete(`/events/${event._id}`); onDelete?.(event._id) } catch { /* */ } finally { setDeleting(false) } }
  async function handleRemoveMember(targetId) { if (!window.confirm('Remove this member?')) return; setRemovingUserId(targetId); try { const res = await api.post(`/events/${event._id}/removeMember`, { userId: targetId }); onMemberRemoved?.(res.data.event) } catch { /* */ } finally { setRemovingUserId(null) } }

  return (
    <>
      <div className="sheet-backdrop" onClick={onClose} />
      <div className="sheet-base" style={{ maxHeight: '80vh' }}>
        <div className="sheet-handle" />

        <div className="event-header" style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', marginBottom: 'var(--sp-3)' }}>
          <div style={{
            width: 40, height: 40, borderRadius: 'var(--radius-sm)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--semantic-job-bg)', color: 'var(--semantic-job)',
            flexShrink: 0,
          }}>
            <IconCalendarEvent size={19} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 'var(--fs-md)', fontWeight: 'var(--fw-medium)', color: 'var(--text-primary)' }}>
              {event.title}
            </div>
            <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)' }}>
              {startTime && formatTimeRange(startTime, endTime)}
            </div>
          </div>
          {isCreator && (
            <span style={{
              fontSize: 'var(--fs-xs)', fontWeight: 'var(--fw-medium)',
              color: 'var(--primary)', background: 'color-mix(in srgb, var(--primary) 10%, var(--bg))',
              padding: 'var(--sp-1) var(--sp-2)', borderRadius: 'var(--radius-pill)',
            }}>
              Host
            </span>
          )}
        </div>

        {event.description && (
          <p style={{ fontSize: 'var(--fs-base)', color: 'var(--text-secondary)', lineHeight: 'var(--lh-normal)', marginBottom: 'var(--sp-3)' }}>
            {event.description}
          </p>
        )}

        {event.interest && (
          <div style={{ marginBottom: 'var(--sp-3)' }}>
            <span className="pill-chip" style={{ background: 'var(--semantic-job-bg)', color: 'var(--semantic-job)' }}>
              {event.interest}
            </span>
          </div>
        )}

        <div className="event-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sp-3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-1)', fontSize: 'var(--fs-sm)', color: 'var(--text-muted)' }}>
            <IconUsers size={14} />
            {event.attendeeCount || event.attendees?.length || 0} going
          </div>
          {isAttendee && !isCreator && (
            <button style={{
              padding: 'var(--sp-2) var(--sp-4)', fontSize: 'var(--fs-sm)',
              border: '1px solid var(--text-muted)', borderRadius: 'var(--radius-sm)',
              background: 'transparent', color: 'var(--text-secondary)',
              cursor: 'pointer', fontFamily: 'inherit',
            }} onClick={handleLeave} disabled={leaving}>
              {leaving ? 'Leaving...' : 'Leave'}
            </button>
          )}
        </div>

        {event.attendees?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-2)', marginBottom: 'var(--sp-3)' }}>
            {event.attendees.map(a => {
              const aId = String(a.user?._id || a.user)
              const isCreatorUser = aId === String(event.creator?._id || event.creator)
              return (
                <div key={aId} style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: 'var(--sp-1) var(--sp-2)', borderRadius: 'var(--radius-pill)',
                  background: 'var(--bg)', boxShadow: 'var(--shadow-raised-sm)',
                  fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)',
                }}>
                  <span style={{ fontSize: 14 }}>{getIcon(a.user?.avatarCategory)}</span>
                  <span>{a.user?.username || 'someone'}</span>
                  {isCreatorUser && <span style={{ color: 'var(--primary)', fontWeight: 'var(--fw-medium)' }}>· Host</span>}
                  {isCreator && !isCreatorUser && (
                    <button onClick={() => handleRemoveMember(aId)} disabled={removingUserId === aId}
                      style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--semantic-danger)', padding: '0 0 0 4px', fontSize: 12, lineHeight: 1 }}>
                      <IconFlag size={12} />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
          {isAttendee && (
            <button className="btn btn-primary btn-full" style={{ fontSize: 'var(--fs-sm)', height: 40 }} onClick={() => onOpenChat?.(event)}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--sp-2)' }}>
                <IconMessageCircle size={18} />
                Open group chat
              </div>
            </button>
          )}

          {!isAttendee && (
            <button className="btn btn-accent btn-full" style={{ fontSize: 'var(--fs-sm)', height: 40 }} onClick={handleJoin} disabled={joining}>
              {joining ? 'Joining...' : 'Join event'}
            </button>
          )}

          {isCreator && (
            <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
              <button className="btn-ghost" style={{ flex: 1, padding: 'var(--sp-2)', fontSize: 'var(--fs-sm)', border: '1px solid var(--text-muted)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }} onClick={() => onEdit?.(event)}>Edit</button>
              <button style={{ flex: 1, padding: 'var(--sp-2)', fontSize: 'var(--fs-sm)', background: 'transparent', color: 'var(--semantic-danger)', border: '1px solid var(--semantic-danger)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontFamily: 'inherit' }} onClick={handleDelete} disabled={deleting}>{deleting ? '...' : 'Delete'}</button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
