import L from 'leaflet'
import { Marker, Popup } from 'react-leaflet'
import { IconCalendarEvent } from '@tabler/icons-react'
import { getIcon } from '../components/AvatarIcon'

function createEventIcon(isCreator) {
  return L.divIcon({
    html: `<div class="map-marker" style="
      width:34px;height:34px;border-radius:10px;
      display:flex;align-items:center;justify-content:center;
      font-size:16px;
      background:#FAEEDA;
      border:2px solid #ECEAE6;
      box-shadow:3px 3px 6px rgba(163,161,155,0.4),-3px -3px 6px rgba(255,255,255,0.7);
      color:#854F0B;
    "><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#854F0B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>`,
    className: '',
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -20],
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
        <div style={{ textAlign: 'center', minWidth: 160, fontFamily: '-apple-system, sans-serif' }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, background: '#FAEEDA', color: '#854F0B',
            marginBottom: 8,
          }}>
            <IconCalendarEvent size={22} />
          </div>
          <div style={{ fontWeight: 600, fontSize: 14, color: '#23241F' }}>{event.title}</div>
          <div style={{ fontSize: 11, color: '#6B6A65', marginTop: 4 }}>{timeStr}</div>
          {event.attendees?.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, marginTop: 8, flexWrap: 'wrap' }}>
              {event.attendees.slice(0, 8).map(a => {
                const userId = a.user?._id || a.user
                return (
                  <span key={String(userId)} style={{
                    width: 24, height: 24, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, background: '#EAF3DE',
                    border: '1px solid #ECEAE6',
                  }}>
                    {getIcon(a.user?.avatarCategory)}
                  </span>
                )
              })}
              {event.attendees.length > 8 && (
                <span style={{ fontSize: 11, color: '#6B6A65' }}>+{event.attendees.length - 8}</span>
              )}
            </div>
          )}
          <div style={{ fontSize: 11, color: '#6B6A65', marginTop: 4 }}>
            {event.attendees?.length || 0} going
          </div>
        </div>
      </Popup>
    </Marker>
  )
}
