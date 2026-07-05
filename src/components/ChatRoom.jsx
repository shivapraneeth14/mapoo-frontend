import { useState, useEffect, useRef } from 'react'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import { useUnread } from '../context/UnreadContext'
import theme from '../styles/theme'

const EMOJIS = ['😀','😂','😍','🥰','😎','🤔','😢','😡','🎉','👍','🔥','❤️','💯','🙏','✨','💪','😊','🤣','🥺','😅']

export default function ChatRoom({ roomId, otherUser, onBack, eventData }) {
  const { user } = useAuth()
  const socket = useSocket()
  const { setCurrentRoom, markRead } = useUnread()
  const isEventRoom = roomId.startsWith('event:')
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [typing, setTyping] = useState(null)
  const [disconnected, setDisconnected] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [showEmoji, setShowEmoji] = useState(false)
  const [hoveredBubble, setHoveredBubble] = useState(null)
  const bottomRef = useRef(null)
  const typingRef = useRef(null)
  const inputRef = useRef(null)
  const holdTimerRef = useRef(null)
  const [eventInfo, setEventInfo] = useState(eventData || null)
  const [removedFromEvent, setRemovedFromEvent] = useState(false)

  const isEventAdminOnly = isEventRoom && eventInfo?.chatMode === 'admin_only'
  const isEventCreator = isEventRoom && String(eventInfo?.creator?._id || eventInfo?.creator) === String(user?.id)
  const canSend = !disconnected && !removedFromEvent && !(isEventAdminOnly && !isEventCreator)

  useEffect(() => {
    if (socket && roomId) {
      socket.emit('join_room', roomId)
      return () => socket.emit('leave_room', roomId)
    }
  }, [socket, roomId])

  useEffect(() => {
    if (!roomId) return
    setCurrentRoom(roomId)
    api.patch('/chat/read', { roomId }).catch(() => {})
    markRead(roomId)
    return () => setCurrentRoom(null)
  }, [roomId, setCurrentRoom, markRead])

  useEffect(() => {
    if (!socket) return
    const handler = (msg) => setMessages(prev => prev.some(m => m._id === msg._id) ? prev : [...prev, msg])
    socket.on('receive_message', handler)
    return () => socket.off('receive_message', handler)
  }, [socket])

  useEffect(() => {
    if (!socket) return
    const handler = ({ messageId }) => setMessages(prev => prev.filter(m => m._id !== messageId))
    socket.on('message_unsent', handler)
    return () => socket.off('message_unsent', handler)
  }, [socket])

  useEffect(() => {
    if (!socket) return
    const start = ({ username }) => setTyping(username)
    const stop = () => setTyping(null)
    socket.on('user_typing', start)
    socket.on('user_stop_typing', stop)
    return () => { socket.off('user_typing', start); socket.off('user_stop_typing', stop) }
  }, [socket])

  useEffect(() => {
    if (!socket || isEventRoom) return
    const handler = () => setDisconnected(true)
    socket.on('connection_removed', handler)
    return () => socket.off('connection_removed', handler)
  }, [socket, isEventRoom])

  useEffect(() => {
    if (!socket || !isEventRoom) return
    const handler = (data) => {
      const eventId = roomId.replace('event:', '')
      if (data.eventId === eventId) {
        setRemovedFromEvent(true)
      }
    }
    socket.on('event_member_removed', handler)
    return () => socket.off('event_member_removed', handler)
  }, [socket, isEventRoom, roomId])

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/chat/messages', { params: { roomId } })
        setMessages(res.data.messages)
      } catch { /* */ } finally { setLoading(false) }
    }
    load()
  }, [roomId])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, typing])

  function handleTyping(isTyping) {
    if (!socket) return
    if (isTyping) {
      socket.emit('typing', { roomId, username: user.username })
      clearTimeout(typingRef.current)
      typingRef.current = setTimeout(() => socket.emit('stop_typing', { roomId }), 2000)
    } else {
      socket.emit('stop_typing', { roomId })
      clearTimeout(typingRef.current)
    }
  }

  async function handleSend(e) {
    e.preventDefault()
    if (!input.trim() || !canSend) return
    const content = input.trim()
    setInput('')
    setShowEmoji(false)
    handleTyping(false)
    try { await api.post('/chat/messages', { roomId, content }) } catch { /* */ }
  }

  function handleEmojiPick(emoji) {
    setInput(prev => prev + emoji)
    inputRef.current?.focus()
  }

  async function handleUnsendMe(msgId) {
    try { await api.patch(`/chat/messages/${msgId}/hide`); setMessages(prev => prev.filter(m => m._id !== msgId)) } catch { /* */ }
    setSelectedMessage(null)
  }

  async function handleUnsendEveryone(msgId) {
    try { await api.delete(`/chat/messages/${msgId}`) } catch { /* */ }
    setSelectedMessage(null)
  }

  function handleHoldStart(m) {
    holdTimerRef.current = setTimeout(() => { setSelectedMessage(m) }, 500)
  }

  function handleHoldEnd() {
    clearTimeout(holdTimerRef.current)
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={onBack}>←</button>
        {isEventRoom ? (
          <>
            <div style={{
              width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
              background: 'linear-gradient(145deg, #d97706, #f59e0b)',
            }}>
              {'\u{1F4C5}'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: theme.fontSize.lg, fontWeight: 600, color: theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {eventInfo?.title || 'Event Chat'}
              </div>
              <div style={{ fontSize: 11, color: theme.textSecondary }}>
                {eventInfo?.attendeeCount || 0} members
              </div>
            </div>
          </>
        ) : (
          <>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: theme.bg, boxShadow: theme.shadow.raisedSm, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>👤</div>
            <span style={{ fontSize: theme.fontSize.lg, fontWeight: 600, color: theme.text }}>{otherUser?.username || 'Chat'}</span>
          </>
        )}
      </div>

      <div style={styles.messages}>
        {loading ? (
          <div style={styles.placeholder}>Loading...</div>
        ) : messages.length === 0 ? (
          <div style={styles.placeholder}>No messages yet. Say hello!</div>
        ) : (
          messages.map((m, i) => {
            const isMe = String(m.sender?._id || m.sender) === String(user?.id)
            const isHovered = hoveredBubble === m._id
            return (
              <div key={m._id || i} style={{
                ...styles.bubble,
                alignSelf: isMe ? 'flex-end' : 'flex-start',
                background: isMe ? theme.accent : theme.bg,
                color: isMe ? '#fff' : theme.text,
                boxShadow: isMe ? '3px 3px 8px rgba(79,70,229,0.3)' : theme.shadow.raisedSm,
                borderBottomRightRadius: isMe ? 4 : 16,
                borderBottomLeftRadius: isMe ? 16 : 4,
              }}
                onMouseEnter={() => setHoveredBubble(m._id)}
                onMouseLeave={() => setHoveredBubble(null)}
                onContextMenu={e => { e.preventDefault(); isMe && setSelectedMessage(m) }}
                onTouchStart={() => isMe && handleHoldStart(m)}
                onTouchEnd={handleHoldEnd}
                onTouchMove={handleHoldEnd}
              >
                <div style={{ fontSize: theme.fontSize.md, lineHeight: 1.4 }}>{m.content}</div>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                  gap: 6, marginTop: 4,
                }}>
                  <span style={{ fontSize: 11, color: isMe ? 'rgba(255,255,255,0.7)' : theme.textMuted }}>
                    {m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                  {isMe && (
                    <button
                      onClick={e => { e.stopPropagation(); setSelectedMessage(m) }}
                      style={{
                        border: 'none', background: 'none', cursor: 'pointer',
                        color: isMe ? 'rgba(255,255,255,0.7)' : theme.textMuted,
                        fontSize: 14, padding: 0, lineHeight: 1,
                        opacity: isHovered ? 1 : 0,
                        transition: 'opacity 0.15s',
                      }}
                    >
                      ⋮
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}
        {typing && (
          <div style={{ ...styles.bubble, alignSelf: 'flex-start', background: theme.bg, color: theme.textSecondary, fontSize: theme.fontSize.sm, boxShadow: theme.shadow.raisedSm, fontStyle: 'italic' }}>
            {typing} is typing...
          </div>
        )}
        {disconnected && (
          <div style={{ textAlign: 'center', color: theme.textMuted, fontSize: theme.fontSize.sm, padding: '12px 0', fontStyle: 'italic' }}>
            You've disconnected from this chat
          </div>
        )}
        {removedFromEvent && (
          <div style={{ textAlign: 'center', color: theme.error, fontSize: theme.fontSize.sm, padding: '12px 0', fontStyle: 'italic' }}>
            You were removed from this event
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {!canSend ? (
        <div style={{ textAlign: 'center', padding: theme.spacing.md, color: theme.textMuted, fontSize: theme.fontSize.sm }}>
          {removedFromEvent ? 'You were removed from this event' : isEventAdminOnly && !isEventCreator ? 'Only the host can send messages in this event' : 'Chat disconnected'}
        </div>
      ) : (
        <form style={styles.inputBar} onSubmit={handleSend}>
          <button
            type="button"
            onClick={() => setShowEmoji(!showEmoji)}
            style={{
              width: 40, height: 40, border: 'none', borderRadius: theme.radius.sm,
              fontSize: 18, background: 'transparent', cursor: 'pointer', flexShrink: 0,
            }}
          >
            😊
          </button>
          <input
            ref={inputRef}
            style={styles.input}
            value={input}
            onChange={e => { setInput(e.target.value); handleTyping(e.target.value.length > 0) }}
            placeholder="Type a message..."
          />
          <button style={styles.sendBtn} type="submit">➤</button>
        </form>
      )}

      {showEmoji && (
        <div style={{
          background: '#fff', borderTop: '1px solid #eee', padding: '8px 12px',
          display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 4,
        }}>
          {EMOJIS.map(e => (
            <button
              key={e}
              type="button"
              style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', padding: 4 }}
              onClick={() => handleEmojiPick(e)}
            >
              {e}
            </button>
          ))}
        </div>
      )}

      {selectedMessage && (
        <>
          <div
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.4)', zIndex: 3000,
              animation: 'fadeIn 0.2s ease-out',
            }}
            onClick={() => setSelectedMessage(null)}
          />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
            zIndex: 3001, background: '#fff', borderRadius: 16,
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)', padding: 16, minWidth: 220,
            animation: 'fadeIn 0.2s ease-out',
          }}>
            <button
              style={{
                width: '100%', padding: '12px', border: 'none', borderRadius: 10,
                fontSize: 14, fontWeight: 500, color: '#333', background: '#f5f5f5',
                cursor: 'pointer', fontFamily: 'inherit', marginBottom: 8,
              }}
              onClick={() => handleUnsendMe(selectedMessage._id)}
            >
              ✉ Unsend for me
            </button>
            <button
              style={{
                width: '100%', padding: '12px', border: 'none', borderRadius: 10,
                fontSize: 14, fontWeight: 500, color: theme.error, background: '#fff0f0',
                cursor: 'pointer', fontFamily: 'inherit', marginBottom: 8,
              }}
              onClick={() => handleUnsendEveryone(selectedMessage._id)}
            >
              ✉ Unsend for everyone
            </button>
            <button
              style={{
                width: '100%', padding: '12px', border: 'none', borderRadius: 10,
                fontSize: 14, fontWeight: 500, color: '#888', background: '#f5f5f5',
                cursor: 'pointer', fontFamily: 'inherit',
              }}
              onClick={() => setSelectedMessage(null)}
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  )
}

const styles = {
  container: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: theme.bg, display: 'flex', flexDirection: 'column', zIndex: 2000 },
  header: { display: 'flex', alignItems: 'center', gap: theme.spacing.md, padding: theme.spacing.lg, background: theme.bg, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  backBtn: { border: 'none', background: 'none', fontSize: 22, cursor: 'pointer', color: theme.text, padding: 4 },
  messages: { flex: 1, overflowY: 'auto', padding: theme.spacing.lg, display: 'flex', flexDirection: 'column', gap: theme.spacing.sm },
  bubble: { maxWidth: '75%', padding: '10px 14px', borderRadius: 16, fontSize: theme.fontSize.md, lineHeight: 1.4 },
  inputBar: { display: 'flex', gap: theme.spacing.sm, padding: theme.spacing.md, background: theme.bg, boxShadow: '0 -2px 8px rgba(0,0,0,0.06)' },
  input: { flex: 1, padding: '12px 16px', border: 'none', borderRadius: theme.radius.md, fontSize: theme.fontSize.md, background: theme.bg, boxShadow: theme.shadow.pressed, outline: 'none', fontFamily: 'inherit', color: theme.text },
  sendBtn: { width: 44, height: 44, border: 'none', borderRadius: theme.radius.md, fontSize: 18, background: theme.accent, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '3px 3px 6px rgba(79,70,229,0.3)' },
  placeholder: { textAlign: 'center', color: theme.textMuted, fontSize: theme.fontSize.md, padding: '40px 20px' },
}
