import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import theme from '../styles/theme'

function createEventIcon(isCreator) {
  const size = 38
  const borderColor = isCreator ? '#6366f1' : '#fff'
  return L.divIcon({
    html: `<div style="
      width: ${size}px; height: ${size}px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 18px;
      background: linear-gradient(145deg, #d97706, #f59e0b);
      box-shadow: 0 0 0 2px ${borderColor}, 0 2px 8px rgba(0,0,0,0.25);
      cursor: pointer;
    ">\u{1F4C5}</div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  })
}

export default function EventMarker({ event, isCreator, onClick }) {
  if (!event?.lat || !event?.lng) return null

  const timeStr = event.startTime
    ? new Date(event.startTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : ''

  return (
    <Marker
      position={[event.lat, event.lng]}
      icon={createEventIcon(isCreator)}
      eventHandlers={{ click: () => onClick?.(event) }}
    >
      <Popup>
        <div style={{
          textAlign: 'center', minWidth: 140, fontFamily: '-apple-system, sans-serif',
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22,
            background: 'linear-gradient(145deg, #d97706, #f59e0b)',
            marginBottom: 8,
          }}>
            {'\u{1F4C5}'}
          </div>
          <div style={{ fontWeight: 600, fontSize: 14, color: theme.text }}>{event.title}</div>
          <div style={{ fontSize: 11, color: theme.textSecondary, marginTop: 4 }}>{timeStr}</div>
          <div style={{ fontSize: 11, color: theme.textSecondary }}>
            {event.attendeeCount || 0} going
          </div>
        </div>
      </Popup>
    </Marker>
  )
}
