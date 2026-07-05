import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import AvatarIcon, { AVATAR_OPTIONS, getIcon } from '../components/AvatarIcon'
import theme from '../styles/theme'

export default function SettingsPage() {
  const { user, logout, updateUser } = useAuth()
  const navigate = useNavigate()
  const [bio, setBio] = useState('')
  const [interests, setInterests] = useState('')
  const [avatarCategory, setAvatarCategory] = useState('')
  const [locationPrivacy, setLocationPrivacy] = useState('fuzzed')
  const [messagePermission, setMessagePermission] = useState('everyone')
  const [pendingRequests, setPendingRequests] = useState([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!user) return
    setBio(user.bio || '')
    setInterests(user.interests?.join(', ') || '')
    setAvatarCategory(user.avatarCategory || '')
    setLocationPrivacy(user.locationPrivacy || 'fuzzed')
    setMessagePermission(user.messagePermission || 'everyone')
    api.get('/chat/requests').then(r => setPendingRequests(r.data.pending)).catch(() => {})
  }, [user])

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true); setSaved(false)
    try {
      const tags = interests.split(',').map(s => s.trim()).filter(Boolean)
      const res = await api.patch('/users/me', {
        bio: bio.trim(),
        interests: tags,
        avatarCategory: avatarCategory || 'default',
        locationPrivacy,
        messagePermission,
      })
      updateUser(res.data.user)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) { setMessage(err.response?.data?.error || 'Failed to save') }
    finally { setSaving(false) }
  }

  async function handleAccept(id) {
    try { await api.patch(`/chat/request/${id}/accept`); api.get('/chat/requests').then(r => setPendingRequests(r.data.pending)).catch(() => {}) }
    catch (err) { setMessage(err.response?.data?.error || 'Failed') }
  }

  async function handleDecline(id) {
    try { await api.patch(`/chat/request/${id}/decline`); api.get('/chat/requests').then(r => setPendingRequests(r.data.pending)).catch(() => {}) }
    catch { /* */ }
  }

  const selectStyle = (selected, opt) => ({
    flex: 1, padding: '10px', border: 'none', borderRadius: theme.radius.sm, fontSize: theme.fontSize.sm, fontWeight: 500,
    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
    background: selected === opt ? theme.accent : theme.bg,
    color: selected === opt ? '#fff' : theme.text,
    boxShadow: selected === opt ? `inset 2px 2px 4px ${theme.accentDark}` : theme.shadow.raisedSm,
  })

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', paddingBottom: 'calc(80px + env(safe-area-inset-bottom))' }}>
      <div className="settings-header" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: `${theme.spacing.lg}px ${theme.spacing.xl}px`,
        background: '#fff', borderBottom: '1px solid #eee',
      }}>
        <button onClick={() => navigate(-1)} style={{ border: 'none', background: 'none', fontSize: 22, cursor: 'pointer', color: '#333', padding: 4 }}>←</button>
        <h1 style={{ margin: 0, fontSize: theme.fontSize.xl, color: '#333' }}>Settings</h1>
        <div style={{ width: 30 }} />
      </div>

      {message && (
        <div style={{ margin: `12px ${theme.spacing.xl}px 0`, padding: '10px 14px', borderRadius: 8, background: '#fff0f0', color: theme.error, fontSize: theme.fontSize.sm, textAlign: 'center', border: '1px solid rgba(211,47,47,0.15)' }}>
          {message}
        </div>
      )}
      {saved && (
        <div style={{ margin: `12px ${theme.spacing.xl}px 0`, padding: '10px 14px', borderRadius: 8, background: '#e8f5e9', color: theme.success, fontSize: theme.fontSize.sm, textAlign: 'center' }}>
          Saved!
        </div>
      )}

      <form onSubmit={handleSave} style={{ padding: `${theme.spacing.xl}px` }}>
        {/* Username + Bio */}
        <div style={{
          background: '#fff', borderRadius: 12, padding: 20, marginBottom: 16,
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <AvatarIcon category={avatarCategory} size={64} />
            <div>
              <div style={{ fontSize: 12, color: '#999', marginBottom: 2 }}>Username</div>
              <div style={{ fontSize: 18, color: '#333', fontWeight: 600 }}>{user?.username}</div>
            </div>
          </div>
          <label style={{ fontSize: 13, color: '#666', marginBottom: 6, display: 'block', fontWeight: 500 }}>Bio</label>
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            placeholder="Tell others about yourself..."
            maxLength={500}
            rows={3}
            style={{
              width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: 8,
              fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
              color: '#333', resize: 'vertical', background: '#fafafa',
            }}
          />
          <div style={{ fontSize: 11, color: '#bbb', textAlign: 'right', marginTop: 4 }}>{bio.length}/500</div>
        </div>

        {/* Avatar picker */}
        <div style={{
          background: '#fff', borderRadius: 12, padding: 20, marginBottom: 16,
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        }}>
          <label style={{ fontSize: 13, color: '#666', marginBottom: 12, display: 'block', fontWeight: 500 }}>Avatar</label>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8,
          }}>
            {AVATAR_OPTIONS.map(({ label, emoji }) => (
              <button
                key={label}
                type="button"
                onClick={() => setAvatarCategory(label)}
                style={{
                  padding: '10px 0', border: avatarCategory === label ? '2px solid #4f46e5' : '2px solid transparent',
                  borderRadius: 12, cursor: 'pointer', background: avatarCategory === label ? '#eef2ff' : '#fafafa',
                  transition: 'all 0.15s', fontFamily: 'inherit', fontSize: 28,
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Interests */}
        <div style={{
          background: '#fff', borderRadius: 12, padding: 20, marginBottom: 16,
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        }}>
          <label style={{ fontSize: 13, color: '#666', marginBottom: 6, display: 'block', fontWeight: 500 }}>Interests / Job tags</label>
          <input
            value={interests}
            onChange={e => setInterests(e.target.value)}
            placeholder="plumber, cricket, gardening"
            style={{
              width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: 8,
              fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
              color: '#333', background: '#fafafa',
            }}
          />
        </div>

        {/* Privacy */}
        <div style={{
          background: '#fff', borderRadius: 12, padding: 20, marginBottom: 16,
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        }}>
          <h3 style={{ fontSize: 13, color: '#999', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 16px' }}>Privacy</h3>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, color: '#666', marginBottom: 8, display: 'block', fontWeight: 500 }}>Location on map</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {['visible', 'fuzzed', 'hidden'].map(opt => (
                <button key={opt} type="button" style={selectStyle(locationPrivacy, opt)} onClick={() => setLocationPrivacy(opt)}>
                  {opt === 'visible' ? 'Visible' : opt === 'fuzzed' ? 'Fuzzed' : 'Hidden'}
                </button>
              ))}
            </div>
            <div style={{ fontSize: 11, color: '#bbb', marginTop: 6 }}>
              {locationPrivacy === 'visible' ? 'Others see approximate location (~100m)' :
               locationPrivacy === 'fuzzed' ? 'Others see fuzzed location (~500m)' :
               'You are hidden from everyone'}
            </div>
          </div>

          <div>
            <label style={{ fontSize: 13, color: '#666', marginBottom: 8, display: 'block', fontWeight: 500 }}>Chat requests</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {['everyone', 'matches', 'nobody'].map(opt => (
                <button key={opt} type="button" style={selectStyle(messagePermission, opt)} onClick={() => setMessagePermission(opt)}>
                  {opt === 'everyone' ? 'Everyone' : opt === 'matches' ? 'Shared interests' : 'No one'}
                </button>
              ))}
            </div>
            <div style={{ fontSize: 11, color: '#bbb', marginTop: 6 }}>
              {messagePermission === 'everyone' ? 'Anyone can send you a chat request' :
               messagePermission === 'matches' ? 'Only users with matching interests' :
               'No one can send you requests'}
            </div>
          </div>
        </div>

        <button
          type="submit" disabled={saving}
          style={{
            width: '100%', padding: '14px', border: 'none', borderRadius: 10,
            fontSize: theme.fontSize.lg, fontWeight: 600, color: '#fff', background: theme.accent,
            cursor: 'pointer', fontFamily: 'inherit', marginBottom: theme.spacing.xxl,
            transition: 'all 0.15s', opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? 'Saving...' : 'Save settings'}
        </button>
      </form>

      {pendingRequests.length > 0 && (
        <section style={{ padding: `0 ${theme.spacing.xl}px`, marginBottom: theme.spacing.xxl }}>
          <h2 style={{ fontSize: 13, color: '#999', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, padding: '0 4px' }}>
            Pending requests ({pendingRequests.length})
          </h2>
          {pendingRequests.map(req => (
            <div key={req._id} style={{
              display: 'flex', gap: 12, padding: 14, background: '#fff', borderRadius: 12,
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: 8, alignItems: 'center',
            }}>
              <AvatarIcon category={req.fromUser?.avatarCategory} size={40} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#333' }}>{req.fromUser?.username}</div>
                <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>{req.fromUser?.interests?.join(', ')}</div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => handleAccept(req._id)} style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: '#e8f5e9', color: theme.success, fontSize: 16, cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>✓</button>
                <button onClick={() => handleDecline(req._id)} style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: '#fff0f0', color: theme.error, fontSize: 16, cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>✕</button>
              </div>
            </div>
          ))}
        </section>
      )}

      <div style={{ padding: `0 ${theme.spacing.xl}px` }}>
        <button
          onClick={logout}
          style={{
            width: '100%', padding: '12px', border: 'none', borderRadius: 10,
            fontSize: theme.fontSize.md, color: theme.error, background: '#fff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)', cursor: 'pointer', fontFamily: 'inherit',
            transition: 'all 0.15s', marginBottom: 40,
          }}
        >
          Log out
        </button>
      </div>
    </div>
  )
}
