import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { useSocket } from './SocketContext'
import { useAuth } from './AuthContext'

const UnreadContext = createContext(null)

export function UnreadProvider({ children }) {
  const socket = useSocket()
  const { user } = useAuth()
  const [unreadByRoom, setUnreadByRoom] = useState({})
  const currentRoomRef = useRef(null)

  useEffect(() => {
    if (!socket || !user) return
    const handler = (msg) => {
      const roomId = msg.roomId
      if (!roomId || roomId === currentRoomRef.current) return
      setUnreadByRoom(prev => ({ ...prev, [roomId]: (prev[roomId] || 0) + 1 }))
    }
    socket.on('receive_message', handler)
    return () => socket.off('receive_message', handler)
  }, [socket, user])

  const markRead = useCallback((roomId) => {
    setUnreadByRoom(prev => ({ ...prev, [roomId]: 0 }))
  }, [])

  const setCurrentRoom = useCallback((roomId) => {
    currentRoomRef.current = roomId
  }, [])

  const totalUnread = Object.values(unreadByRoom).reduce((sum, n) => sum + n, 0)
  const unreadChats = Object.values(unreadByRoom).filter(n => n > 0).length

  return (
    <UnreadContext.Provider value={{ unreadByRoom, totalUnread, unreadChats, markRead, setCurrentRoom }}>
      {children}
    </UnreadContext.Provider>
  )
}

export function useUnread() {
  const ctx = useContext(UnreadContext)
  if (!ctx) throw new Error('useUnread must be used within UnreadProvider')
  return ctx
}
