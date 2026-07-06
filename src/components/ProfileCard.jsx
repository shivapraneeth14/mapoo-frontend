import { useState } from 'react'
import api from '../api/client'
import { IconFlag, IconBan, IconMessageCircle, IconCheck, IconX } from '@tabler/icons-react'
import AvatarIcon from './AvatarIcon'

export default function ProfileCard({ user, onClose, onChatRequest, chatStatus, onCancelRequest, onRemoveConnection, onOpenChat, onAcceptRequest, onDeclineRequest }) {
  const [status, setStatus] = useState('')
  const [showReport, setShowReport] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [accepting, setAccepting] = useState(false)
  const [declining, setDeclining] = useState(false)

  if (!user) return null

  async function handleBlock() {
    if (!window.confirm(`Block ${user.username}?`)) return
    try {
      await api.post('/block', { userId: user.id })
      setStatus('Blocked')
      setTimeout(onClose, 1000)
    } catch (err) { setStatus(err.response?.data?.error || 'Failed to block') }
  }

  async function handleReport(e) {
    e.preventDefault()
    try {
      await api.post('/report', { userId: user.id, reason: reportReason })
      setStatus('Reported')
      setShowReport(false)
      setTimeout(onClose, 1000)
    } catch (err) { setStatus(err.response?.data?.error || 'Failed to report') }
  }

  function handleRemove() {
    if (!window.confirm(`Remove connection with ${user.username}?`)) return
    onRemoveConnection(chatStatus.requestId)
  }

  async function handleAccept() {
    setAccepting(true)
    try { await onAcceptRequest(chatStatus.requestId) } catch { setStatus('Failed to accept') }
    setAccepting(false)
  }

  async function handleDecline() {
    setDeclining(true)
    try { await onDeclineRequest(chatStatus.requestId) } catch { setStatus('Failed to decline') }
    setDeclining(false)
  }

  function renderAction() {
    if (!chatStatus) return null

    if (chatStatus.status === 'none') {
      return (
        <button className="btn btn-primary btn-full" onClick={() => onChatRequest(user)}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--sp-2)' }}>
            <IconMessageCircle size={18} />
            Send chat request
          </div>
        </button>
      )
    }

    if (chatStatus.status === 'pending') {
      if (chatStatus.direction === 'sent') {
        return (
          <div style={{ display: 'flex', gap: 'var(--sp-3)' }}>
            <button style={{ flex: 1, background: 'var(--bg)', boxShadow: 'var(--shadow-pressed)', color: 'var(--text-muted)', border: 'none', borderRadius: 'var(--radius-sm)', padding: '12px', fontSize: 'var(--fs-sm)', cursor: 'default', fontFamily: 'inherit' }}>
              Request sent
            </button>
            <button className="btn btn-primary btn-full" style={{ flex: 'none', width: 'auto', padding: '12px 20px', fontSize: 'var(--fs-sm)' }} onClick={() => onCancelRequest(chatStatus.requestId)}>
              Cancel
            </button>
          </div>
        )
      }
      return (
        <div style={{ display: 'flex', gap: 'var(--sp-3)' }}>
          <button className="btn btn-primary" style={{ flex: 1, fontSize: 'var(--fs-sm)', padding: '12px 20px' }} onClick={handleAccept} disabled={accepting}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--sp-1)' }}>
              <IconCheck size={16} />
              {accepting ? '...' : 'Accept'}
            </div>
          </button>
          <button style={{ flex: 1, background: 'transparent', border: '1px solid var(--text-muted)', color: 'var(--text-secondary)', borderRadius: 'var(--radius-sm)', padding: '12px 20px', fontSize: 'var(--fs-sm)', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--sp-1)' }} onClick={handleDecline} disabled={declining}>
            <IconX size={16} />
            {declining ? '...' : 'Decline'}
          </button>
        </div>
      )
    }

    if (chatStatus.status === 'accepted') {
      return (
        <>
          <button className="btn btn-primary btn-full" onClick={() => onOpenChat(chatStatus.roomId, user)}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--sp-2)' }}>
              <IconMessageCircle size={18} />
              Chat with {user.username}
            </div>
          </button>
          <button style={{ width: '100%', background: 'transparent', border: '1px solid var(--text-muted)', color: 'var(--semantic-danger)', borderRadius: 'var(--radius-sm)', padding: '10px', fontSize: 'var(--fs-sm)', cursor: 'pointer', fontFamily: 'inherit', marginTop: 'var(--sp-2)' }} onClick={handleRemove}>
            Remove connection
          </button>
        </>
      )
    }

    return null
  }

  return (
    <>
      <div className="sheet-backdrop" onClick={onClose} />
      <div className="sheet-base">
        <div className="sheet-handle" />

        <div className="profile-header" style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', marginBottom: 'var(--sp-4)' }}>
          <AvatarIcon category={user.avatarCategory} size={72} />
          <div>
            <div style={{ fontSize: 'var(--fs-lg)', fontWeight: 'var(--fw-medium)', color: 'var(--text-primary)' }}>
              {user.username}
            </div>
            {user.hostedEventsCount > 0 && (
              <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', marginTop: 'var(--sp-1)' }}>
                Hosted {user.hostedEventsCount} event{user.hostedEventsCount > 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>

        {user.bio && (
          <p style={{ fontSize: 'var(--fs-base)', color: 'var(--text-secondary)', lineHeight: 'var(--lh-relaxed)', marginBottom: 'var(--sp-4)' }}>
            {user.bio}
          </p>
        )}

        {user.interests?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-2)', marginBottom: 'var(--sp-6)' }}>
            {user.interests.map(tag => (
              <span key={tag} className="pill-chip">
                {tag}
              </span>
            ))}
          </div>
        )}

        {status && (
          <div style={{ color: 'var(--semantic-people)', fontSize: 'var(--fs-sm)', marginBottom: 'var(--sp-2)', textAlign: 'center', fontWeight: 'var(--fw-medium)' }}>
            {status}
          </div>
        )}

        <div style={{ marginBottom: 'var(--sp-4)' }}>
          {renderAction()}
        </div>

        <div style={{ display: 'flex', gap: 'var(--sp-3)', justifyContent: 'flex-start' }}>
          {showReport ? (
            <form onSubmit={handleReport} style={{ flex: 1 }}>
              <textarea
                className="input-field"
                style={{ minHeight: 60, marginBottom: 'var(--sp-2)', padding: 'var(--sp-2) var(--sp-3)', fontSize: 'var(--fs-sm)' }}
                placeholder="Why are you reporting this user?"
                value={reportReason}
                onChange={e => setReportReason(e.target.value)}
                required
                rows={3}
              />
              <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, fontSize: 'var(--fs-sm)', padding: '10px 16px' }}>Submit report</button>
                <button type="button" className="btn-ghost" style={{ fontSize: 'var(--fs-sm)' }} onClick={() => setShowReport(false)}>Cancel</button>
              </div>
            </form>
          ) : (
            <>
              <button className="btn-icon" onClick={handleBlock} style={{ color: 'var(--semantic-danger)' }}>
                <IconBan size={18} />
              </button>
              <button className="btn-icon" onClick={() => setShowReport(true)} style={{ color: 'var(--semantic-danger)' }}>
                <IconFlag size={18} />
              </button>
            </>
          )}
        </div>
      </div>
    </>
  )
}
