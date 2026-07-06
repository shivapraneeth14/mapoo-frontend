import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents, Popup } from 'react-leaflet'
import { IconPlus } from '@tabler/icons-react'
import L from 'leaflet'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'
import AvatarIcon, { getIcon } from '../components/AvatarIcon'
import UserMarker from '../components/UserMarker'
import SearchBar from '../components/SearchBar'
import ProfileCard from '../components/ProfileCard'
import EventMarker from '../components/EventMarker'
import EventCard from '../components/EventCard'
import CreateEventSheet from '../components/CreateEventSheet'

function createOwnIcon(avatarCategory) {
  const emoji = getIcon(avatarCategory)
  return L.divIcon({
    html: `<div style="
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
  })
}

function hashCode(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash |= 0
  }
  return Math.abs(hash)
}

function fuzzClientCoords(lat, lng, userId, precision) {
  const seed = hashCode(String(userId))
  return {
    lat: lat + ((seed % 1000) / 1000 - 0.5) * precision,
    lng: lng + (((seed * 31) % 1000) / 1000 - 0.5) * precision,
  }
}

function LocationMarker({ onLocationFound, hasSavedLocation }) {
  const map = useMap()
  const { user } = useAuth()
  const [position, setPosition] = useState(
    hasSavedLocation ? { lat: user.lat, lng: user.lng } : null
  )

  useEffect(() => {
    map.locate({ setView: !hasSavedLocation, maxZoom: 14 })
    const handler = (e) => { setPosition(e.latlng); onLocationFound(e.latlng) }
    map.on('locationfound', handler)
    return () => map.off('locationfound', handler)
  }, [map, onLocationFound, hasSavedLocation])

  useEffect(() => {
    if (position) api.patch('/users/location', { lat: position.lat, lng: position.lng }).catch(() => {})
  }, [position])

  const markerPosition = position && user?.locationPrivacy === 'fuzzed'
    ? fuzzClientCoords(position.lat, position.lng, user?.id, 0.003)
    : position

  return markerPosition ? (
    <Marker position={[markerPosition.lat, markerPosition.lng]} icon={createOwnIcon(user?.avatarCategory)}>
      <Popup><div style={{ textAlign: 'center', fontFamily: '-apple-system,sans-serif' }}>
        <strong>{user?.username || 'You'}</strong>
        <div style={{ fontSize: 12, color: '#6B6A65' }}>
          {user?.locationPrivacy === 'fuzzed' ? 'Fuzzed location' : 'Your location'}
        </div>
      </div></Popup>
    </Marker>
  ) : null
}

function PickingHandler({ onMapClick }) {
  useMapEvents({ click: (e) => onMapClick?.(e.latlng) })
  return null
}

function eventPinIcon() {
  return L.divIcon({
    html: `<div style="
      width:34px;height:34px;border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      font-size:18px;
      background:#D85A30;
      border:3px solid #fff;
      box-shadow:0 2px 8px rgba(0,0,0,0.3);
      color:#fff;
    ">📍</div>`,
    className: '',
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  })
}

export default function MapPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [nearbyUsers, setNearbyUsers] = useState([])
  const [center, setCenter] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedUserStatus, setSelectedUserStatus] = useState(null)
  const [interestFilter, setInterestFilter] = useState('')
  const [filteredUsers, setFilteredUsers] = useState([])
  const [nearbyEvents, setNearbyEvents] = useState([])
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showCreateEvent, setShowCreateEvent] = useState(false)
  const [editEvent, setEditEvent] = useState(null)
  const [pickingEventLocation, setPickingEventLocation] = useState(false)
  const [selectedEventLocation, setSelectedEventLocation] = useState(null)
  const [pickingTempLocation, setPickingTempLocation] = useState(null)
  const hasSavedLocation = user?.lat && user?.lng
  const initialCenter = hasSavedLocation ? [user.lat, user.lng] : [20, 0]
  const initialZoom = hasSavedLocation ? 14 : 2

  const fetchNearby = useCallback(async (lat, lng) => {
    try {
      const res = await api.get('/geo/nearby', { params: { lat, lng, maxDist: 50000 } })
      setNearbyUsers(res.data.users)
    } catch { /* */ }
  }, [])

  const fetchEvents = useCallback(async (lat, lng, interest) => {
    try {
      const params = { lat, lng, maxDist: 50000 }
      if (interest) params.interest = interest
      const res = await api.get('/events', { params })
      setNearbyEvents(res.data.events || [])
    } catch { /* */ }
  }, [])

  const onLocationFound = useCallback((latlng) => {
    setCenter(latlng)
    fetchNearby(latlng.lat, latlng.lng)
    fetchEvents(latlng.lat, latlng.lng)
  }, [fetchNearby, fetchEvents])

  useEffect(() => {
    if (hasSavedLocation && user?.lat && user?.lng) {
      setCenter({ lat: user.lat, lng: user.lng })
      fetchNearby(user.lat, user.lng)
      fetchEvents(user.lat, user.lng)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function handleSelectUser(user) {
    setSelectedUser(user)
    setSelectedUserStatus(null)
    api.get(`/chat/status/${user.id}`).then(res => {
      setSelectedUserStatus(res.data)
    }).catch(() => {
      setSelectedUserStatus({ status: 'none' })
    })
  }

  async function handleSearch(query) {
    setInterestFilter(query)
    const lat = center?.lat || user?.lat
    const lng = center?.lng || user?.lng
    if (!lat || !lng) return
    try {
      const res = await api.get('/geo/search', { params: { q: query, lat, lng, maxDist: 50000 } })
      setFilteredUsers(res.data.users || [])
    } catch { setFilteredUsers([]) }
    fetchEvents(lat, lng, query)
  }

  function handleClearFilter() {
    setInterestFilter('')
    setFilteredUsers([])
    const lat = center?.lat || user?.lat
    const lng = center?.lng || user?.lng
    if (lat && lng) fetchEvents(lat, lng)
  }

  async function handleChatRequest(user) {
    try {
      await api.post('/chat/request', { toUserId: user.id })
      setSelectedUser(null)
    } catch { /* */ }
  }

  async function handleCancelRequest(requestId) {
    try { await api.delete(`/chat/request/${requestId}`); setSelectedUser(null) } catch { /* */ }
  }

  async function handleRemoveConnection(requestId) {
    try { await api.patch(`/chat/request/${requestId}/remove`); setSelectedUser(null) } catch { /* */ }
  }

  function handleOpenChat(roomId, partner) {
    navigate('/chat', { state: { openRoom: roomId, partner } })
  }

  async function handleAcceptRequest(requestId) {
    await api.patch(`/chat/request/${requestId}/accept`)
    setSelectedUser(null)
  }

  async function handleDeclineRequest(requestId) {
    await api.patch(`/chat/request/${requestId}/decline`)
    setSelectedUser(null)
  }

  function handleSelectEvent(event) { setSelectedEvent(event) }
  function handleJoinEvent(data) { setSelectedEvent(data.event); fetchEvents(center?.lat || user?.lat, center?.lng || user?.lng) }
  function handleLeaveEvent() { setSelectedEvent(null); fetchEvents(center?.lat || user?.lat, center?.lng || user?.lng) }
  function handleDeleteEvent() { setSelectedEvent(null); fetchEvents(center?.lat || user?.lat, center?.lng || user?.lng) }
  function handleCreateEvent() { setShowCreateEvent(false); setEditEvent(null); setSelectedEventLocation(null); if (center) fetchEvents(center.lat, center.lng) }
  function handleEditEvent(event) { setEditEvent(event); setShowCreateEvent(true); setSelectedEvent(null) }
  function handleOpenEventChat(event) { navigate('/chat', { state: { openRoom: `event:${event._id}`, event } }) }

  function handlePickLocation() {
    setPickingEventLocation(true)
    setPickingTempLocation(null)
  }

  function handleCancelPickLocation() {
    setPickingEventLocation(false)
    setPickingTempLocation(null)
  }

  function handleConfirmPickLocation() {
    if (pickingTempLocation) {
      setSelectedEventLocation(pickingTempLocation)
    }
    setPickingEventLocation(false)
    setPickingTempLocation(null)
  }

  function handleMapClick(latlng) {
    if (pickingEventLocation) {
      setPickingTempLocation(latlng)
    }
  }

  function handleUseCurrentLocation() {
    setSelectedEventLocation(null)
  }

  const displayUsers = interestFilter ? filteredUsers : nearbyUsers

  return (
    <div className="map-page">
      <div className="map-header">
        <SearchBar
          onSearch={handleSearch}
          activeFilter={interestFilter}
          onClearFilter={handleClearFilter}
        />
        <button
          className="profile-avatar-button"
          onClick={() => navigate('/settings')}
          style={{ fontSize: 18 }}
        >
          {getIcon(user?.avatarCategory)}
        </button>
      </div>

      <div className="map-container">
        <MapContainer center={initialCenter} zoom={initialZoom} style={{ height: '100%', width: '100%' }} zoomControl={false}>
          <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <LocationMarker onLocationFound={onLocationFound} hasSavedLocation={hasSavedLocation} />
          {displayUsers.map(u => <UserMarker key={u.id} user={u} onClick={handleSelectUser} />)}
          {nearbyEvents.map(e => (
            <EventMarker key={e._id} event={e} isCreator={String(e.creator?._id || e.creator) === String(user?.id)} onClick={handleSelectEvent} />
          ))}
          {pickingEventLocation && <PickingHandler onMapClick={handleMapClick} />}
          {pickingTempLocation && (
            <Marker position={[pickingTempLocation.lat, pickingTempLocation.lng]} icon={eventPinIcon()} />
          )}
        </MapContainer>

        {displayUsers.length === 0 && nearbyEvents.length === 0 && (
          <div className="map-empty-state">
            <div style={{ fontSize: 40, color: 'var(--text-muted)', marginBottom: 'var(--sp-3)' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <div style={{ fontSize: 'var(--fs-base)', color: 'var(--text-muted)', maxWidth: 260 }}>
              {interestFilter ? 'Try a different search or browse all nearby' : "No one nearby yet — be the first to post an event!"}
            </div>
          </div>
        )}

        {interestFilter && (
          <div className="active-filter-chip">
            <span>{interestFilter}</span>
            <button onClick={handleClearFilter} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: 'var(--text-muted)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        )}

        <button
          className="fab-create-event"
          onClick={() => { setEditEvent(null); setShowCreateEvent(true) }}
        >
          <IconPlus size={22} />
        </button>
      </div>

      {selectedUser && (
        <ProfileCard
          user={selectedUser}
          chatStatus={selectedUserStatus}
          onClose={() => { setSelectedUser(null); setSelectedUserStatus(null) }}
          onChatRequest={handleChatRequest}
          onCancelRequest={handleCancelRequest}
          onRemoveConnection={handleRemoveConnection}
          onOpenChat={handleOpenChat}
          onAcceptRequest={handleAcceptRequest}
          onDeclineRequest={handleDeclineRequest}
        />
      )}

      {selectedEvent && !showCreateEvent && (
        <EventCard
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onJoin={handleJoinEvent}
          onLeave={handleLeaveEvent}
          onEdit={handleEditEvent}
          onDelete={handleDeleteEvent}
          onOpenChat={handleOpenEventChat}
          onMemberRemoved={(updatedEvent) => {
            setSelectedEvent(updatedEvent)
            fetchEvents(center?.lat || user?.lat, center?.lng || user?.lng)
          }}
        />
      )}

      {showCreateEvent && (
        <CreateEventSheet
          key={editEvent?._id || 'new'}
          initialData={editEvent ? { ...editEvent, lat: center?.lat || user?.lat, lng: center?.lng || user?.lng } : { lat: center?.lat || user?.lat, lng: center?.lng || user?.lng }}
          onClose={() => { setShowCreateEvent(false); setEditEvent(null); setSelectedEventLocation(null) }}
          onSubmit={handleCreateEvent}
          selectedLocation={selectedEventLocation}
          onPickLocation={handlePickLocation}
          pickingLocation={pickingEventLocation}
          onCancelPickLocation={handleCancelPickLocation}
          onLocationConfirmed={(loc) => { setSelectedEventLocation(loc); setPickingEventLocation(false); setPickingTempLocation(null) }}
        />
      )}

      {pickingEventLocation && pickingTempLocation && (
        <div style={{
          position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)',
          zIndex: 1001, display: 'flex', gap: 'var(--sp-2)',
        }}>
          <button onClick={handleCancelPickLocation}
            style={{
              padding: 'var(--sp-3) var(--sp-4)', borderRadius: 'var(--radius-pill)',
              border: 'none', background: 'var(--bg)',
              boxShadow: 'var(--shadow-raised)', color: 'var(--text-secondary)',
              fontSize: 'var(--fs-sm)', cursor: 'pointer', fontFamily: 'inherit',
              fontWeight: 'var(--fw-medium)',
            }}>
            Cancel
          </button>
          <button onClick={handleConfirmPickLocation}
            style={{
              padding: 'var(--sp-3) var(--sp-4)', borderRadius: 'var(--radius-pill)',
              border: 'none', background: 'var(--accent)',
              boxShadow: 'var(--shadow-raised)', color: '#fff',
              fontSize: 'var(--fs-sm)', cursor: 'pointer', fontFamily: 'inherit',
              fontWeight: 'var(--fw-medium)',
            }}>
            Use this location
          </button>
        </div>
      )}
    </div>
  )
}
