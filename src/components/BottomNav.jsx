import { useLocation, useNavigate } from 'react-router-dom'
import { useUnread } from '../context/UnreadContext'
import theme from '../styles/theme'

const tabs = [
  { path: '/map', label: 'Map', icon: '\u{1F5FA}\uFE0F' },
  { path: '/chat', label: 'Chat', icon: '\u{1F4AC}' },
]

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const { unreadChats } = useUnread()

  return (
    <div className="bottom-nav" style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      display: 'flex',
      background: theme.bg,
      boxShadow: `0 -4px 10px rgba(0,0,0,0.08)`,
      zIndex: 1000,
      padding: '4px 0',
      paddingBottom: 'env(safe-area-inset-bottom, 4px)',
    }}>
      {tabs.map(tab => {
        const active = location.pathname === tab.path
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            style={{
              flex: 1,
              padding: '8px 0',
              border: 'none',
              borderRadius: 0,
              background: active ? theme.bg : theme.bg,
              fontSize: theme.fontSize.sm,
              cursor: 'pointer',
              color: active ? theme.accent : theme.textSecondary,
              boxShadow: active ? theme.shadow.pressedSm : 'none',
              transition: 'all 0.2s',
              fontFamily: 'inherit',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <div style={{ fontSize: 20, lineHeight: 1, position: 'relative' }}>
              {tab.icon}
              {tab.path === '/chat' && unreadChats > 0 && (
                <span style={{
                  position: 'absolute', top: -6, right: -10,
                  background: '#e74c3c', color: '#fff',
                  fontSize: 10, fontWeight: 700,
                  minWidth: 18, height: 18,
                  borderRadius: 9,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0 4px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                }}>
                  {unreadChats > 99 ? '99+' : unreadChats}
                </span>
              )}
            </div>
            <div style={{ fontWeight: active ? 600 : 400 }}>{tab.label}</div>
          </button>
        )
      })}
    </div>
  )
}
