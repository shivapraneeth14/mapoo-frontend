import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { IconMessageCircle, IconCalendarEvent } from '@tabler/icons-react'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useUnread } from '../context/UnreadContext'
import { useSocket } from '../context/SocketContext'
import AvatarIcon from '../components/AvatarIcon'
import ChatRoom from '../components/ChatRoom'

const tabs = ['pending', 'active', 'sent']

export default function ChatPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const socket = useSocket()
  const [pending, setPending] = useState([])
  const [accepted, setAccepted] = useState([])
  const [sent, setSent] = useState([])
  const [myEvents, setMyEvents] = useState([])
  const [activeTab, setActiveTab] = useState('active')
  const [activeRoom, setActiveRoom] = useState(location.state?.openRoom || null)
  const [activePartner, setActivePartner] = useState(location.state?.partner || null)
  const [activeEvent, setActiveEvent] = useState(location.state?.event || null)
  const [loading, setLoading] = useState(true)
  const [flash, setFlash] = useState('')
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
    try { await api.patch(`/chat/request/${id}/accept`); setFlash('Accepted!'); loadRequests() }
    catch (err) { setFlash(err.response?.data?.error || 'Failed') }
  }

  async function handleDecline(id) {
    try { await api.patch(`/chat/request/${id}/decline`); loadRequests() } catch { /* */ }
  }

  async function handleCancel(id) {
    try { await api.delete(`/chat/request/${id}`); loadRequests() } catch { /* */ }
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

  const allTabsEmpty = pending.length === 0 && accepted.length === 0 && sent.length === 0 && myEvents.length === 0

  if (activeRoom) {
    return <ChatRoom roomId={activeRoom} otherUser={activePartner} eventData={activeEvent} onBack={() => { setActiveRoom(null); setActivePartner(null); setActiveEvent(null); loadRequests() }} />
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--sp-4) var(--sp-4) var(--sp-3)' }}>
        <h1 style={{ margin: 0, fontSize: 'var(--fs-xl)', color: 'var(--text-primary)', fontWeight: 'var(--fw-medium)' }}>Chats</h1>
        <button className="profile-avatar-button" onClick={() => navigate('/settings')}>
          <AvatarIcon category={user?.avatarCategory} size={18} />
        </button>
      </div>

      {/* Segmented control tabs */}
      <div style={{
        display: 'flex', background: 'var(--bg)', boxShadow: 'var(--shadow-pressed)',
        borderRadius: 'var(--radius-pill)', padding: 3, margin: '0 var(--sp-4) var(--sp-3)',
      }}>
        {tabs.map(tab => {
          const count = tab === 'pending' ? pending.length : tab === 'active' ? accepted.length : sent.length
          const label = tab.charAt(0).toUpperCase() + tab.slice(1) + (count > 0 ? ` (${count})` : '')
          return (
            <button key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1, textAlign: 'center', padding: 'var(--sp-2) 0', fontSize: 'var(--fs-sm)',
                borderRadius: 'var(--radius-pill)', border: 'none',
                background: activeTab === tab ? 'var(--bg)' : 'transparent',
                boxShadow: activeTab === tab ? 'var(--shadow-raised-sm)' : 'none',
                color: activeTab === tab ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: activeTab === tab ? 'var(--fw-medium)' : 'var(--fw-regular)',
                cursor: 'pointer', fontFamily: 'inherit',
                transition: 'all var(--dur-base) var(--ease-standard)',
              }}
            >
              {label}
            </button>
          )
        })}
      </div>

      {flash && <div style={{ color: 'var(--semantic-people)', fontSize: 'var(--fs-sm)', textAlign: 'center', padding: 'var(--sp-2) var(--sp-4)' }}>{flash}</div>}

      <div style={{ flex: 1, overflowY: 'auto', padding: `0 var(--sp-4) var(--sp-4)` }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: 'var(--fs-sm)' }}>Loading...</div>
        ) : allTabsEmpty ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: 40, color: 'var(--text-muted)', marginBottom: 'var(--sp-3)', display: 'flex', justifyContent: 'center' }}>
              <IconMessageCircle size={40} />
            </div>
            <div style={{ fontSize: 'var(--fs-lg)', fontWeight: 'var(--fw-medium)', color: 'var(--text-primary)' }}>No conversations yet</div>
            <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)', marginTop: 'var(--sp-2)', lineHeight: 1.6, maxWidth: 280, margin: '8px auto 0' }}>
              Find people nearby by interest or job, then send a chat request. You can only message after they accept.
            </div>
            <button className="btn btn-primary" style={{ marginTop: 'var(--sp-6)' }} onClick={() => navigate('/map')}>
              Find people on the map
            </button>
          </div>
        ) : activeTab === 'pending' && pending.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: 'var(--fs-sm)' }}>No pending requests</div>
        ) : activeTab === 'pending' && pending.length > 0 ? (
          <div>
            {pending.map(req => (
              <div key={req._id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', padding: 'var(--sp-3) var(--sp-3)', borderRadius: 'var(--radius-md)', background: 'var(--bg)', boxShadow: 'var(--shadow-raised)', marginBottom: 'var(--sp-2)' }}>
                <AvatarIcon category={req.fromUser?.avatarCategory} size={48} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 'var(--fs-base)', fontWeight: 'var(--fw-medium)', color: 'var(--text-primary)' }}>{req.fromUser?.username}</div>
                  <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {req.fromUser?.interests?.join(', ')}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 'var(--sp-1)' }}>
                  <button onClick={() => handleAccept(req._id)} style={{ padding: 'var(--sp-1) var(--sp-3)', fontSize: 'var(--fs-sm)', borderRadius: 'var(--radius-pill)', border: 'none', background: 'var(--primary)', color: 'var(--text-on-primary)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 'var(--fw-medium)' }}>
                    Accept
                  </button>
                  <button onClick={() => handleDecline(req._id)} style={{ padding: 'var(--sp-1) var(--sp-3)', fontSize: 'var(--fs-sm)', borderRadius: 'var(--radius-pill)', border: '1px solid var(--text-muted)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'inherit' }}>
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : activeTab === 'active' ? (
          <div>
            {accepted.map(req => {
              const isFromMe = String(req.fromUser?._id) === String(user?.id)
              const partner = isFromMe ? req.toUser : req.fromUser
              const roomId = req.roomId
              const unread = unreadByRoom[roomId] || req.unreadCount || 0
              return (
                <div key={req._id} onClick={() => openChat(req)}
                  style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', padding: 'var(--sp-3) var(--sp-3)', borderRadius: 'var(--radius-md)', background: 'var(--bg)', boxShadow: 'var(--shadow-raised)', marginBottom: 'var(--sp-2)', cursor: 'pointer', transition: 'all var(--dur-fast)' }}>
                  <AvatarIcon category={partner?.avatarCategory} size={48} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 'var(--fs-base)', fontWeight: 'var(--fw-medium)', color: 'var(--text-primary)' }}>{partner?.username}</div>
                    <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {unread > 0 ? `${unread} unread` : (partner?.interests?.join(', ') || '')}
                    </div>
                  </div>
                  {unread > 0 && (
                    <span style={{ minWidth: 18, height: 18, borderRadius: 'var(--radius-pill)', background: 'var(--semantic-danger)', color: '#fff', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px' }}>
                      {unread}
                    </span>
                  )}
                </div>
              )
            })}
            {myEvents.map(ev => (
              <div key={ev._id} onClick={() => openEventChat(ev)}
                style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', padding: 'var(--sp-3) var(--sp-3)', borderRadius: 'var(--radius-md)', background: 'var(--bg)', boxShadow: 'var(--shadow-raised)', marginBottom: 'var(--sp-2)', cursor: 'pointer' }}>
                <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--semantic-job-bg)', color: 'var(--semantic-job)', flexShrink: 0 }}>
                  <IconCalendarEvent size={20} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 'var(--fs-base)', fontWeight: 'var(--fw-medium)', color: 'var(--text-primary)' }}>{ev.title}</div>
                  <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)' }}>{ev.attendeeCount || 0} members</div>
                </div>
              </div>
            ))}
            {accepted.length === 0 && myEvents.length === 0 && (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: 'var(--fs-sm)' }}>No active chats</div>
            )}
          </div>
        ) : (
          <div>
            {sent.map(req => (
              <div key={req._id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', padding: 'var(--sp-3) var(--sp-3)', borderRadius: 'var(--radius-md)', background: 'var(--bg)', boxShadow: 'var(--shadow-raised)', marginBottom: 'var(--sp-2)' }}>
                <AvatarIcon category={req.toUser?.avatarCategory} size={48} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 'var(--fs-base)', fontWeight: 'var(--fw-medium)', color: 'var(--text-primary)' }}>{req.toUser?.username}</div>
                  <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--semantic-job)' }}>Awaiting response...</div>
                </div>
                <button onClick={() => handleCancel(req._id)} style={{ padding: 'var(--sp-1) var(--sp-3)', fontSize: 'var(--fs-sm)', borderRadius: 'var(--radius-pill)', border: '1px solid var(--semantic-danger)', background: 'transparent', color: 'var(--semantic-danger)', cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}>
                  Cancel
                </button>
              </div>
            ))}
            {sent.length === 0 && (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: 'var(--fs-sm)' }}>No sent requests</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
