import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, useMap, Popup } from 'react-leaflet'
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
import theme from '../styles/theme'

function createOwnIcon(avatarCategory) {
  const emoji = getIcon(avatarCategory)
  return L.divIcon({
    html: `<div style="position:relative;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;background:linear-gradient(145deg,#4f46e5,#6366f1);box-shadow:0 0 0 3px white,0 0 12px rgba(79,70,229,0.5);">${emoji}<div style="position:absolute;bottom:-2px;right:-6px;background:#4f46e5;color:#fff;font-size:8px;padding:1px 5px;border-radius:6px;font-weight:700;border:1.5px solid #fff;line-height:1.2;">me</div></div>`,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  })
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

  return position ? (
    <Marker position={[position.lat, position.lng]} icon={createOwnIcon(user?.avatarCategory)}>
      <Popup><div style={{ textAlign: 'center', fontFamily: '-apple-system,sans-serif' }}>
        <strong>{user?.username || 'You'}</strong>
        <div style={{ fontSize: 12, color: '#666' }}>Your location</div>
      </div></Popup>
    </Marker>
  ) : null
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
    console.log('handleSelectUser:', user.id, user.username)
    setSelectedUser(user)
    setSelectedUserStatus(null)
    api.get(`/chat/status/${user.id}`).then(res => {
      console.log('chatStatus response:', res.data)
      setSelectedUserStatus(res.data)
    }).catch(err => {
      console.log('chatStatus error:', err?.response?.data || err.message)
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
      alert('Chat request sent!')
    } catch (err) { alert(err.response?.data?.error || 'Failed') }
  }

  async function handleCancelRequest(requestId) {
    try {
      await api.delete(`/chat/request/${requestId}`)
      setSelectedUser(null)
    } catch { alert('Failed to cancel') }
  }

  async function handleRemoveConnection(requestId) {
    try {
      await api.patch(`/chat/request/${requestId}/remove`)
      setSelectedUser(null)
    } catch { alert('Failed to remove') }
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

  function handleSelectEvent(event) {
    setSelectedEvent(event)
  }

  function handleJoinEvent(data) {
    setSelectedEvent(data.event)
    fetchEvents(center?.lat || user?.lat, center?.lng || user?.lng)
  }

  function handleLeaveEvent() {
    setSelectedEvent(null)
    fetchEvents(center?.lat || user?.lat, center?.lng || user?.lng)
  }

  function handleDeleteEvent() {
    setSelectedEvent(null)
    fetchEvents(center?.lat || user?.lat, center?.lng || user?.lng)
  }

  function handleCreateEvent() {
    setShowCreateEvent(false)
    setEditEvent(null)
    if (center) fetchEvents(center.lat, center.lng)
  }

  function handleEditEvent(event) {
    setEditEvent(event)
    setShowCreateEvent(true)
    setSelectedEvent(null)
  }

  function handleOpenEventChat(event) {
    navigate('/chat', { state: { openRoom: `event:${event._id}`, event } })
  }

  return (
    <div style={{ height: '100vh', width: '100%', position: 'relative' }}>
      <div className="map-top-bar" style={{
        position: 'absolute', top: 12, left: 12, right: 12, zIndex: 1000,
        display: 'flex', gap: 8, alignItems: 'flex-start',
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <SearchBar
            onSearch={handleSearch}
            activeFilter={interestFilter}
            onClearFilter={handleClearFilter}
          />
        </div>
        <button
          onClick={() => navigate('/settings')}
          className="map-avatar-btn"
          style={{
            width: 42, height: 42, borderRadius: '50%', border: 'none',
            background: 'none', cursor: 'pointer', padding: 0, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <AvatarIcon category={user?.avatarCategory} size={38} />
        </button>
      </div>
      <MapContainer center={initialCenter} zoom={initialZoom} style={{ height: '100%', width: '100%' }} zoomControl={false}>
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <LocationMarker onLocationFound={onLocationFound} hasSavedLocation={hasSavedLocation} />
        {(interestFilter ? filteredUsers : nearbyUsers).map(u => <UserMarker key={u.id} user={u} onClick={handleSelectUser} />)}
        {nearbyEvents.map(e => (
          <EventMarker key={e._id} event={e} isCreator={String(e.creator?._id || e.creator) === String(user?.id)} onClick={handleSelectEvent} />
        ))}
      </MapContainer>

      <button
        onClick={() => { setEditEvent(null); setShowCreateEvent(true) }}
        className="map-fab"
        style={{
          position: 'absolute', bottom: 80, right: 16, zIndex: 1000,
          width: 56, height: 56, borderRadius: '50%', border: 'none',
          background: theme.bg, boxShadow: theme.shadow.raised,
          fontSize: 28, cursor: 'pointer', color: theme.text,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'inherit', lineHeight: 1,
        }}
      >
        +
      </button>

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
          onClose={() => { setShowCreateEvent(false); setEditEvent(null) }}
          onSubmit={handleCreateEvent}
        />
      )}
    </div>
  )
}

const styles = {}
