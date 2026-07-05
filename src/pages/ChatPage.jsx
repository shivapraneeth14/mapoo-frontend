import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useUnread } from '../context/UnreadContext'
import { useSocket } from '../context/SocketContext'
import AvatarIcon from '../components/AvatarIcon'
import theme from '../styles/theme'
import ChatRoom from '../components/ChatRoom'

export default function ChatPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const socket = useSocket()
  const [pending, setPending] = useState([])
  const [accepted, setAccepted] = useState([])
  const [sent, setSent] = useState([])
  const [myEvents, setMyEvents] = useState([])
  const [activeRoom, setActiveRoom] = useState(location.state?.openRoom || null)
  const [activePartner, setActivePartner] = useState(location.state?.partner || null)
  const [activeEvent, setActiveEvent] = useState(location.state?.event || null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const { unreadByRoom } = useUnread()

  const loadRequests = useCallback(async () => {
    try {
      const res = await api.get('/chat/requests')
      setPending(res.data.pending)
      setAccepted(res.data.accepted)
      setSent(res.data.sent)
    } catch { /* */ }
    try {
      const ev = await api.get('/events', { params: { attendedBy: user?.id, lat: user?.lat, lng: user?.lng } })
      setMyEvents(ev.data.events || [])
    } catch { /* */ }
    setLoading(false)
  }, [user?.id])

  useEffect(() => { loadRequests() }, [loadRequests])

  useEffect(() => {
    if (!socket) return
    const handler = () => { loadRequests() }
    socket.on('event_member_removed', handler)
    return () => socket.off('event_member_removed', handler)
  }, [socket, loadRequests])

  async function handleAccept(id) {
    try { await api.patch(`/chat/request/${id}/accept`); setMessage('Accepted!'); loadRequests() }
    catch (err) { setMessage(err.response?.data?.error || 'Failed') }
  }

  async function handleDecline(id) {
    try { await api.patch(`/chat/request/${id}/decline`); loadRequests() } catch { /* */ }
  }

  function openChat(req) {
    const isFromMe = String(req.fromUser?._id || req.fromUser) === String(user?.id)
    const other = isFromMe ? req.toUser : req.fromUser
    const ids = [String(req.fromUser?._id || req.fromUser), String(req.toUser?._id || req.toUser)].sort()
    setActiveRoom(ids.join(':'))
    setActivePartner(other)
    setActiveEvent(null)
  }

  function openEventChat(event) {
    setActiveRoom(`event:${event._id}`)
    setActivePartner(null)
    setActiveEvent(event)
  }

  if (activeRoom) {
    return <ChatRoom roomId={activeRoom} otherUser={activePartner} eventData={activeEvent} onBack={() => { setActiveRoom(null); setActivePartner(null); setActiveEvent(null); loadRequests() }} />
  }

  return (
    <div style={styles.page}>
      <div className="chat-header" style={styles.header}>
        <h1 style={styles.title}>Chats</h1>
        <button
          onClick={() => navigate('/settings')}
          style={{
            width: 40, height: 40, borderRadius: '50%', border: 'none',
            background: 'none', cursor: 'pointer', padding: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <AvatarIcon category={user?.avatarCategory} size={36} />
        </button>
      </div>

      {message && <div style={styles.message}>{message}</div>}

      {loading ? (
        <div style={styles.loading}>Loading...</div>
      ) : (
        <div style={styles.content}>
          {pending.length > 0 && (
            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>Pending ({pending.length})</h2>
              {pending.map(req => (
                <div key={req._id} style={styles.requestCard}>
                  <AvatarIcon category={req.fromUser?.avatarCategory} size={44} />
                  <div style={styles.info}>
                    <div style={styles.name}>{req.fromUser?.username}</div>
                    <div style={styles.tags}>{req.fromUser?.interests?.join(', ')}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button style={styles.acceptBtn} onClick={() => handleAccept(req._id)}>✓</button>
                    <button style={styles.declineBtn} onClick={() => handleDecline(req._id)}>✕</button>
                  </div>
                </div>
              ))}
            </section>
          )}

          {accepted.length > 0 && (
            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>Active ({accepted.length})</h2>
              {accepted.map(req => {
                const isFromMe = String(req.fromUser?._id) === String(user?.id)
                const partner = isFromMe ? req.toUser : req.fromUser
                const roomId = req.roomId
                const unread = unreadByRoom[roomId] || req.unreadCount || 0
                return (
                  <div key={req._id} style={styles.chatCard} onClick={() => openChat(req)}>
                    <AvatarIcon category={partner?.avatarCategory} size={44} />
                    <div style={styles.info}>
                      <div style={styles.name}>{partner?.username}</div>
                      {unread > 0 ? (
                        <div style={{ fontSize: theme.fontSize.xs, color: theme.accent, fontWeight: 600, marginTop: 2 }}>
                          {unread} unread
                        </div>
                      ) : (
                        <div style={styles.tags}>{partner?.interests?.join(', ')}</div>
                      )}
                    </div>
                    <span style={{ color: theme.textMuted, fontSize: 18 }}>→</span>
                  </div>
                )
              })}
            </section>
          )}

          {myEvents.length > 0 && (
            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>Events ({myEvents.length})</h2>
              {myEvents.map(ev => (
                <div key={ev._id} style={styles.chatCard} onClick={() => openEventChat(ev)}>
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, flexShrink: 0,
                    background: 'linear-gradient(145deg, #d97706, #f59e0b)',
                    color: '#fff',
                  }}>
                    {'\u{1F4C5}'}
                  </div>
                  <div style={styles.info}>
                    <div style={styles.name}>{ev.title}</div>
                    <div style={styles.tags}>{ev.attendeeCount || 0} members</div>
                  </div>
                  <span style={{ color: theme.textMuted, fontSize: 18 }}>→</span>
                </div>
              ))}
            </section>
          )}

          {sent.length > 0 && (
            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>Sent</h2>
              {sent.map(req => (
                <div key={req._id} style={styles.chatCard}>
                  <AvatarIcon category={req.toUser?.avatarCategory} size={44} />
                  <div style={styles.info}>
                    <div style={styles.name}>{req.toUser?.username}</div>
                    <div style={{ ...styles.tags, color: theme.warning }}>Awaiting response...</div>
                  </div>
                </div>
              ))}
            </section>
          )}

          {pending.length === 0 && accepted.length === 0 && sent.length === 0 && myEvents.length === 0 && (
            <div style={styles.empty}>
              <div style={{ fontSize: 48, marginBottom: theme.spacing.md }}>{'\u{1F4AC}'}</div>
              <div style={{ fontSize: theme.fontSize.lg, fontWeight: 600, color: theme.text }}>No chats yet</div>
              <div style={{ fontSize: theme.fontSize.sm, color: theme.textSecondary, marginTop: theme.spacing.sm, lineHeight: 1.6, maxWidth: 280, margin: '8px auto 0' }}>
                Find people nearby by interest or job, then send a chat request. You can only message after they accept.
              </div>
              <button
                onClick={() => navigate('/map')}
                style={{
                  marginTop: theme.spacing.xl,
                  padding: '12px 28px',
                  borderRadius: theme.radius.md,
                  background: theme.bg,
                  boxShadow: theme.shadow.raised,
                  border: 'none',
                  color: theme.text,
                  fontSize: theme.fontSize.md,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.15s',
                }}
              >
                {'\u{1F5FA}\uFE0F'} Find people on the map
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: theme.bg, paddingBottom: 'calc(64px + env(safe-area-inset-bottom))' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `${theme.spacing.xl}px ${theme.spacing.xl}px ${theme.spacing.md}px` },
  title: { margin: 0, fontSize: theme.fontSize.xxl, color: theme.text },
  message: { margin: `0 ${theme.spacing.xl}px ${theme.spacing.md}px`, padding: '10px 14px', borderRadius: theme.radius.sm, background: '#e8f5e9', color: theme.success, fontSize: theme.fontSize.sm, textAlign: 'center' },
  loading: { textAlign: 'center', padding: 40, color: theme.textSecondary },
  content: { padding: `0 ${theme.spacing.xl}px ${theme.spacing.xl}px` },
  section: { marginBottom: theme.spacing.xxl },
  sectionTitle: { fontSize: theme.fontSize.xs, fontWeight: 600, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: theme.spacing.sm },
  requestCard: { display: 'flex', alignItems: 'center', gap: theme.spacing.md, padding: theme.spacing.md, borderRadius: theme.radius.lg, background: theme.bg, boxShadow: theme.shadow.raised, marginBottom: theme.spacing.sm },
  chatCard: { display: 'flex', alignItems: 'center', gap: theme.spacing.md, padding: theme.spacing.md, borderRadius: theme.radius.lg, background: theme.bg, boxShadow: theme.shadow.raised, marginBottom: theme.spacing.sm, cursor: 'pointer', transition: 'all 0.15s' },
  info: { flex: 1, minWidth: 0 },
  name: { fontSize: theme.fontSize.md, fontWeight: 600, color: theme.text },
  tags: { fontSize: theme.fontSize.xs, color: theme.textSecondary, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  acceptBtn: { width: 36, height: 36, borderRadius: '50%', border: 'none', background: theme.bg, color: theme.success, fontSize: 16, cursor: 'pointer', boxShadow: theme.shadow.raisedSm, transition: 'all 0.15s' },
  declineBtn: { width: 36, height: 36, borderRadius: '50%', border: 'none', background: theme.bg, color: theme.error, fontSize: 16, cursor: 'pointer', boxShadow: theme.shadow.raisedSm, transition: 'all 0.15s' },
  empty: { textAlign: 'center', padding: '80px 20px' },
}
