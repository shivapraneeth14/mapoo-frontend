import { useState } from 'react'
import api from '../api/client'
import AvatarIcon from './AvatarIcon'
import theme from '../styles/theme'

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
    } catch (err) {
      setStatus(err.response?.data?.error || 'Failed to block')
    }
  }

  async function handleReport(e) {
    e.preventDefault()
    try {
      await api.post('/report', { userId: user.id, reason: reportReason })
      setStatus('Reported')
      setShowReport(false)
      setTimeout(onClose, 1000)
    } catch (err) {
      setStatus(err.response?.data?.error || 'Failed to report')
    }
  }

  function handleRemove() {
    if (!window.confirm(`Remove connection with ${user.username}?`)) return
    onRemoveConnection(chatStatus.requestId)
  }

  async function handleAccept() {
    setAccepting(true)
    try {
      await onAcceptRequest(chatStatus.requestId)
    } catch { setStatus('Failed to accept') }
    setAccepting(false)
  }

  async function handleDecline() {
    setDeclining(true)
    try {
      await onDeclineRequest(chatStatus.requestId)
    } catch { setStatus('Failed to decline') }
    setDeclining(false)
  }

  function renderAction() {
    if (!chatStatus) return null

    if (chatStatus.status === 'none') {
      return (
        <button
          style={styles.chatBtn}
          onClick={() => onChatRequest(user)}
        >
          💬 Send Chat Request
        </button>
      )
    }

    if (chatStatus.status === 'pending') {
      if (chatStatus.direction === 'sent') {
        return (
          <div style={{ display: 'flex', gap: theme.spacing.sm }}>
            <button style={{ ...styles.chatBtn, flex: 1, background: '#f0f0f0', color: '#999' }} disabled>
              ⏳ Pending
            </button>
            <button
              style={{ ...styles.chatBtn, flex: 1, background: '#f0f0f0', color: theme.error }}
              onClick={() => onCancelRequest(chatStatus.requestId)}
            >
              Cancel
            </button>
          </div>
        )
      }
      return (
        <div style={{ display: 'flex', gap: theme.spacing.sm }}>
          <button
            style={{ ...styles.chatBtn, flex: 1 }}
            onClick={handleAccept}
            disabled={accepting}
          >
            {accepting ? '...' : '✓ Accept'}
          </button>
          <button
            style={{ ...styles.chatBtn, flex: 1, background: '#f0f0f0', color: theme.error }}
            onClick={handleDecline}
            disabled={declining}
          >
            {declining ? '...' : '✕ Decline'}
          </button>
        </div>
      )
    }

    if (chatStatus.status === 'accepted') {
      return (
        <>
          <button
            style={styles.chatBtn}
            onClick={() => onOpenChat(chatStatus.roomId, user)}
          >
            💬 Chat with {user.username}
          </button>
          <button
            style={{ ...styles.chatBtn, marginTop: theme.spacing.sm, background: '#f0f0f0', color: theme.error }}
            onClick={handleRemove}
          >
            Remove connection
          </button>
        </>
      )
    }

    return null
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
          maxHeight: '75vh', overflowY: 'auto',
          animation: 'slideUp 0.3s ease-out',
          padding: '16px 20px 24px',
        }}
      >
        {/* Drag handle */}
        <div style={{
          width: 36, height: 4, borderRadius: 2,
          background: '#ddd', margin: '0 auto 12px',
        }} />

        {/* Close button (top right) */}
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

        {/* Avatar */}
        <div style={{ textAlign: 'center', marginBottom: 12, marginTop: 4 }}>
          <AvatarIcon category={user.avatarCategory} size={72} />
        </div>

        {/* Username */}
        <h2 style={{
          margin: '0 0 4px', fontSize: 20, color: '#333',
          fontWeight: 600, textAlign: 'center',
        }}>
          {user.username}
        </h2>

        {/* Bio */}
        {user.bio && (
          <p style={{
            margin: '0 0 12px', fontSize: 13, color: '#777',
            textAlign: 'center', lineHeight: 1.5,
          }}>
            {user.bio}
          </p>
        )}

        {/* Interests */}
        {user.interests?.length > 0 && (
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 6,
            justifyContent: 'center', marginBottom: 16,
          }}>
            {user.interests.map(tag => (
              <span key={tag} style={{
                padding: '4px 12px', borderRadius: 16,
                fontSize: 12, background: '#f0f0f0', color: '#666',
                fontWeight: 500,
              }}>
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Status message */}
        {status && (
          <div style={{
            color: theme.success, fontSize: 13, marginBottom: 12,
            textAlign: 'center', fontWeight: 500,
          }}>
            {status}
          </div>
        )}

        {/* Action buttons */}
        <div style={{ marginBottom: 16 }}>
          {renderAction()}
        </div>

        {/* Block / Report */}
        {showReport ? (
          <form onSubmit={handleReport} style={{ marginTop: 8 }}>
            <textarea
              style={{
                width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0',
                borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box',
                fontFamily: 'inherit', color: '#333', resize: 'none',
                background: '#fafafa', marginBottom: 8,
              }}
              placeholder="Why are you reporting this user?"
              value={reportReason}
              onChange={e => setReportReason(e.target.value)}
              required
              rows={3}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" style={styles.reportSubmit}>Submit report</button>
              <button type="button" style={styles.cancelBtn} onClick={() => setShowReport(false)}>Cancel</button>
            </div>
          </form>
        ) : (
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <button onClick={handleBlock} style={styles.secondaryBtn}>Block</button>
            <button onClick={() => setShowReport(true)} style={styles.secondaryBtn}>Report</button>
          </div>
        )}
      </div>
    </>
  )
}

const styles = {
  chatBtn: {
    width: '100%', padding: '12px', border: 'none', borderRadius: 10,
    fontSize: 14, fontWeight: 600, color: '#fff', background: theme.accent,
    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
  },
  secondaryBtn: {
    padding: '8px 20px', border: 'none', borderRadius: 8,
    fontSize: 13, color: '#888', background: '#f0f0f0',
    cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500,
    transition: 'all 0.15s',
  },
  reportSubmit: {
    flex: 1, padding: '10px', border: 'none', borderRadius: 8,
    fontSize: 13, color: '#fff', background: theme.warning,
    cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500,
  },
  cancelBtn: {
    padding: '10px 16px', border: 'none', borderRadius: 8,
    fontSize: 13, color: '#888', background: '#f0f0f0',
    cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500,
  },
}
