import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { getIcon } from './AvatarIcon'

function createIcon(avatarCategory, username) {
  const emoji = getIcon(avatarCategory)
  return L.divIcon({
    html: `<div class="map-marker" style="
      width:34px;height:34px;border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      font-size:16px;
      background:#EAF3DE;
      border:2px solid #ECEAE6;
      box-shadow:3px 3px 6px rgba(163,161,155,0.4),-3px -3px 6px rgba(255,255,255,0.7);
      color:#3B6D11;
    ">${emoji}</div>`,
    className: '',
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -20],
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
        <div style={{ textAlign: 'center', minWidth: 120, fontFamily: '-apple-system, sans-serif' }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, background: '#EAF3DE', color: '#3B6D11',
            marginBottom: 8,
          }}>
            {getIcon(user.avatarCategory)}
          </div>
          <div style={{ fontWeight: 600, fontSize: 14, color: '#23241F' }}>{user.username}</div>
          <div style={{ fontSize: 12, color: '#6B6A65', marginTop: 4 }}>
            {user.interests?.join(', ') || 'No interests'}
          </div>
        </div>
      </Popup>
    </Marker>
  )
}
