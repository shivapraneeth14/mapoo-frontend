import { useLocation, useNavigate } from 'react-router-dom'
import { IconMap2, IconMessageCircle } from '@tabler/icons-react'
import { useUnread } from '../context/UnreadContext'

const tabs = [
  { path: '/map', label: 'Map', icon: IconMap2 },
  { path: '/chat', label: 'Chat', icon: IconMessageCircle },
]

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const { unreadChats } = useUnread()

  return (
    <nav className="bottom-nav" style={{
      zIndex: 1000,
      flexShrink: 0,
    }}>
      {tabs.map(tab => {
        const active = location.pathname === tab.path
        return (
          <button
            key={tab.path}
            className={`nav-item ${active ? 'active' : ''}`}
            onClick={() => navigate(tab.path)}
            style={{}}
          >
            <div className="nav-icon" style={{ position: 'relative' }}>
              <tab.icon size={20} />
              {tab.path === '/chat' && unreadChats > 0 && (
                <span className="nav-badge" />
              )}
            </div>
            <span className="nav-label">{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
