import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { getIcon } from './AvatarIcon'
import theme from '../styles/theme'

const COLORS = [
  '#4f46e5', '#0891b2', '#059669', '#d97706',
  '#dc2626', '#7c3aed', '#db2777', '#2563eb',
]

function hashColor(name) {
  if (!name) return COLORS[0]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return COLORS[Math.abs(hash) % COLORS.length]
}

function createIcon(avatarCategory, username) {
  const emoji = getIcon(avatarCategory)
  const color = hashColor(username)
  const html = `
    <div style="
      width: 42px; height: 42px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 20px;
      background: ${color};
      box-shadow: 0 0 0 2px white, 0 2px 8px rgba(0,0,0,0.2);
      cursor: pointer;
    ">${emoji}</div>
  `
  return L.divIcon({
    html,
    className: '',
    iconSize: [42, 42],
    iconAnchor: [21, 21],
    popupAnchor: [0, -24],
  })
}

export default function UserMarker({ user, onClick }) {
  if (!user?.lat || !user?.lng) return null

  return (
    <Marker
      position={[user.lat, user.lng]}
      icon={createIcon(user.avatarCategory, user.username)}
      eventHandlers={{ click: () => onClick?.(user) }}
    >
      <Popup>
        <div style={{
          textAlign: 'center', minWidth: 120, fontFamily: '-apple-system, sans-serif',
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24,
            background: hashColor(user.username),
            marginBottom: 8,
          }}>
            {getIcon(user.avatarCategory)}
          </div>
          <div style={{ fontWeight: 600, fontSize: 14, color: theme.text }}>{user.username}</div>
          <div style={{ fontSize: 12, color: theme.textSecondary, marginTop: 4 }}>
            {user.interests?.join(', ') || 'No interests'}
          </div>
        </div>
      </Popup>
    </Marker>
  )
}
