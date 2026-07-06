import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconArrowLeft, IconMoodSmile, IconSend } from '@tabler/icons-react'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import { useUnread } from '../context/UnreadContext'

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
    if (socket && roomId) { socket.emit('join_room', roomId); return () => socket.emit('leave_room', roomId) }
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
      if (data.eventId === eventId) setRemovedFromEvent(true)
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

  function handleEmojiPick(emoji) { setInput(prev => prev + emoji); inputRef.current?.focus() }
  async function handleUnsendMe(msgId) { try { await api.patch(`/chat/messages/${msgId}/hide`); setMessages(prev => prev.filter(m => m._id !== msgId)) } catch { /* */ }; setSelectedMessage(null) }
  async function handleUnsendEveryone(msgId) { try { await api.delete(`/chat/messages/${msgId}`) } catch { /* */ }; setSelectedMessage(null) }
  function handleHoldStart(m) { holdTimerRef.current = setTimeout(() => { setSelectedMessage(m) }, 500) }
  function handleHoldEnd() { clearTimeout(holdTimerRef.current) }

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'var(--bg)', display: 'flex', flexDirection: 'column', zIndex: 2000 }}>
      {/* Header */}
      <div className="chatroom-header" style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', padding: 'var(--sp-3) var(--sp-4)', background: 'var(--bg)', flexShrink: 0 }}>
        <button onClick={onBack} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 4, display: 'flex', color: 'var(--text-primary)' }}>
          <IconArrowLeft size={20} />
        </button>
        <span style={{ fontSize: 'var(--fs-md)', fontWeight: 'var(--fw-medium)', color: 'var(--text-primary)' }}>
          {isEventRoom ? (eventInfo?.title || 'Event Chat') : (otherUser?.username || 'Chat')}
        </span>
      </div>

      {/* Messages */}
      <div className="message-list" style={{ flex: 1, overflowY: 'auto', padding: 'var(--sp-4)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 20px', fontSize: 'var(--fs-sm)' }}>Loading...</div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 20px', fontSize: 'var(--fs-sm)' }}>No messages yet. Say hello!</div>
        ) : (
          messages.map((m, i) => {
            const isMe = String(m.sender?._id || m.sender) === String(user?.id)
            return (
              <div key={m._id || i}
                style={{
                  alignSelf: isMe ? 'flex-end' : 'flex-start',
                  maxWidth: '75%',
                  padding: 'var(--sp-2) var(--sp-3)',
                  fontSize: 'var(--fs-base)',
                  lineHeight: 'var(--lh-normal)',
                  borderRadius: 'var(--radius-md)',
                  background: isMe ? 'var(--primary)' : 'var(--bg)',
                  color: isMe ? 'var(--text-on-primary)' : 'var(--text-primary)',
                  boxShadow: isMe ? 'none' : 'var(--shadow-raised-sm)',
                  borderBottomRightRadius: isMe ? '4px' : 'var(--radius-md)',
                  borderBottomLeftRadius: isMe ? 'var(--radius-md)' : '4px',
                  animation: 'bubbleEnter var(--dur-base) var(--ease-standard) forwards',
                  position: 'relative',
                }}
                onContextMenu={e => { e.preventDefault(); isMe && setSelectedMessage(m) }}
                onTouchStart={() => isMe && handleHoldStart(m)}
                onTouchEnd={handleHoldEnd}
                onTouchMove={handleHoldEnd}
              >
                <div>{m.content}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4, marginTop: 4 }}>
                  <span style={{ fontSize: 11, color: isMe ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)' }}>
                    {m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                  {isMe && (
                    <span style={{
                      fontSize: 12, color: 'rgba(255,255,255,0.7)',
                      animation: 'fadeIn 150ms var(--ease-standard) 100ms forwards',
                      opacity: 0,
                    }}>
                      ✓
                    </span>
                  )}
                </div>
              </div>
            )
          })
        )}

        {/* Typing indicator */}
        {typing && (
          <div className="typing-indicator" style={{
            alignSelf: 'flex-start',
            background: 'var(--bg)', boxShadow: 'var(--shadow-raised-sm)',
            borderRadius: 'var(--radius-md)', padding: 'var(--sp-2) var(--sp-3)',
            display: 'flex', gap: 4,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-muted)', animation: 'typingDot1 600ms var(--ease-standard) infinite' }} />
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-muted)', animation: 'typingDot2 600ms var(--ease-standard) infinite 120ms' }} />
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-muted)', animation: 'typingDot3 600ms var(--ease-standard) infinite 240ms' }} />
          </div>
        )}

        {disconnected && <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--fs-sm)', fontStyle: 'italic', padding: '12px 0' }}>You've disconnected from this chat</div>}
        {removedFromEvent && <div style={{ textAlign: 'center', color: 'var(--semantic-danger)', fontSize: 'var(--fs-sm)', fontStyle: 'italic', padding: '12px 0' }}>You were removed from this event</div>}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      {!canSend ? (
        <div style={{ textAlign: 'center', padding: 'var(--sp-3)', color: 'var(--text-muted)', fontSize: 'var(--fs-sm)' }}>
          {removedFromEvent ? 'You were removed from this event' : isEventAdminOnly && !isEventCreator ? 'Only the host can send messages' : 'Chat disconnected'}
        </div>
      ) : (
        <form className="chatroom-input-bar" style={{
          display: 'flex', alignItems: 'center', gap: 'var(--sp-2)',
          padding: 'var(--sp-3) var(--sp-4)', background: 'var(--bg)', flexShrink: 0,
        }} onSubmit={handleSend}>
          <button type="button" onClick={() => setShowEmoji(!showEmoji)}
            style={{ width: 40, height: 40, borderRadius: 'var(--radius-circle)', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', flexShrink: 0 }}>
            <IconMoodSmile size={22} />
          </button>
          <input ref={inputRef}
            style={{
              flex: 1, height: 40, padding: '0 var(--sp-4)', border: 'none', borderRadius: 'var(--radius-pill)',
              background: 'var(--bg)', boxShadow: 'var(--shadow-pressed)', fontSize: 'var(--fs-base)',
              color: 'var(--text-primary)', fontFamily: 'inherit', outline: 'none',
            }}
            value={input}
            onChange={e => { setInput(e.target.value); handleTyping(e.target.value.length > 0) }}
            placeholder="Type a message..."
          />
          <button type="submit" disabled={!input.trim()}
            style={{
              width: 40, height: 40, borderRadius: 'var(--radius-circle)', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              background: input.trim() ? 'var(--primary)' : 'var(--bg)',
              boxShadow: input.trim() ? 'var(--shadow-raised-sm)' : 'var(--shadow-pressed)',
              color: input.trim() ? 'var(--text-on-primary)' : 'var(--text-muted)',
              cursor: input.trim() ? 'pointer' : 'default',
              transition: 'all var(--dur-fast) var(--ease-standard)',
            }}>
            <IconSend size={20} />
          </button>
        </form>
      )}

      {/* Emoji picker */}
      {showEmoji && (
        <div style={{ background: 'var(--bg)', borderTop: '1px solid rgba(163,161,155,0.2)', padding: 'var(--sp-2) var(--sp-3)', display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 4 }}>
          {EMOJIS.map(e => (
            <button key={e} type="button" style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', padding: 4, lineHeight: 1 }} onClick={() => handleEmojiPick(e)}>
              {e}
            </button>
          ))}
        </div>
      )}

      {/* Message actions modal */}
      {selectedMessage && (
        <>
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(35,36,31,0.4)', zIndex: 3000 }} onClick={() => setSelectedMessage(null)} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 3001, background: 'var(--bg)', borderRadius: 'var(--radius-modal)', boxShadow: 'var(--shadow-raised)', padding: 'var(--sp-4)', minWidth: 220, animation: 'fadeIn var(--dur-fast) forwards' }}>
            <button style={{ width: '100%', padding: 'var(--sp-3)', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: 'var(--fs-sm)', color: 'var(--text-primary)', background: 'var(--bg)', boxShadow: 'var(--shadow-raised-sm)', cursor: 'pointer', fontFamily: 'inherit', marginBottom: 'var(--sp-2)' }} onClick={() => handleUnsendMe(selectedMessage._id)}>
              Unsend for me
            </button>
            <button style={{ width: '100%', padding: 'var(--sp-3)', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: 'var(--fs-sm)', color: 'var(--semantic-danger)', background: 'var(--semantic-danger-bg)', cursor: 'pointer', fontFamily: 'inherit', marginBottom: 'var(--sp-2)' }} onClick={() => handleUnsendEveryone(selectedMessage._id)}>
              Unsend for everyone
            </button>
            <button style={{ width: '100%', padding: 'var(--sp-3)', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', background: 'var(--bg)', cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => setSelectedMessage(null)}>
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  )
}
