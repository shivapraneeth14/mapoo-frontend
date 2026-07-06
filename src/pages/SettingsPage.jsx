import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconArrowLeft } from '@tabler/icons-react'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import AvatarIcon, { AVATAR_OPTIONS } from '../components/AvatarIcon'

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
        bio: bio.trim(), interests: tags,
        avatarCategory: avatarCategory || 'default',
        locationPrivacy, messagePermission,
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

  function SegmentedToggle({ value, options, onChange }) {
    return (
      <div style={{ display: 'flex', background: 'var(--bg)', boxShadow: 'var(--shadow-pressed)', borderRadius: 'var(--radius-pill)', padding: 3 }}>
        {options.map(opt => (
          <button key={opt.value} type="button"
            onClick={() => onChange(opt.value)}
            style={{
              flex: 1, textAlign: 'center', padding: 'var(--sp-2) 0', fontSize: 'var(--fs-sm)',
              borderRadius: 'var(--radius-pill)', border: 'none',
              background: value === opt.value ? 'var(--bg)' : 'transparent',
              boxShadow: value === opt.value ? 'var(--shadow-raised-sm)' : 'none',
              color: value === opt.value ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: value === opt.value ? 'var(--fw-medium)' : 'var(--fw-regular)',
              cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all var(--dur-base) var(--ease-standard)',
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg)', overflow: 'hidden' }}>
      {/* Header */}
      <div className="settings-header" style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', padding: 'var(--sp-3) var(--sp-4)', flexShrink: 0 }}>
        <button onClick={() => navigate(-1)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 4, display: 'flex', color: 'var(--text-primary)' }}>
          <IconArrowLeft size={20} />
        </button>
        <h1 style={{ margin: 0, fontSize: 'var(--fs-lg)', fontWeight: 'var(--fw-medium)', color: 'var(--text-primary)' }}>Settings</h1>
      </div>

      {message && <div style={{ color: 'var(--semantic-danger)', fontSize: 'var(--fs-sm)', textAlign: 'center', padding: 'var(--sp-2) var(--sp-4)' }}>{message}</div>}
      {saved && <div style={{ color: 'var(--semantic-people)', fontSize: 'var(--fs-sm)', textAlign: 'center', padding: 'var(--sp-2) var(--sp-4)' }}>Saved!</div>}

      <div className="settings-scroll" style={{ flex: 1, overflowY: 'auto', padding: `0 var(--sp-4) var(--sp-8)` }}>
        <form onSubmit={handleSave}>
          {/* Profile section */}
          <section className="settings-section" style={{ marginBottom: 'var(--sp-8)' }}>
            <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', marginBottom: 'var(--sp-3)' }}>Profile</div>

            <div className="surface-card" style={{ padding: 'var(--sp-4)', marginBottom: 'var(--sp-4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)', marginBottom: 'var(--sp-4)' }}>
                <AvatarIcon category={avatarCategory} size={64} />
                <div>
                  <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', marginBottom: 2 }}>Username</div>
                  <div style={{ fontSize: 'var(--fs-lg)', color: 'var(--text-primary)', fontWeight: 'var(--fw-medium)' }}>{user?.username}</div>
                </div>
              </div>

              <label style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--sp-2)' }}>Bio</label>
              <textarea className="input-field" value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell others about yourself..." maxLength={500} rows={3} />
              <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', textAlign: 'right', marginTop: 'var(--sp-1)' }}>{bio.length}/500</div>
            </div>

            {/* Avatar picker */}
            <div className="surface-card" style={{ padding: 'var(--sp-4)', marginBottom: 'var(--sp-4)' }}>
              <label style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--sp-3)' }}>Avatar</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 'var(--sp-2)' }}>
                {AVATAR_OPTIONS.map(({ label, emoji }) => (
                  <button key={label} type="button" onClick={() => setAvatarCategory(label)}
                    style={{
                      width: 48, height: 48, borderRadius: '50%', margin: '0 auto',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 22, border: (avatarCategory || 'default') === label ? '2px solid var(--primary)' : 'none',
                      background: 'var(--bg)',
                      boxShadow: (avatarCategory || 'default') === label ? 'var(--shadow-pressed)' : 'var(--shadow-raised-sm)',
                      cursor: 'pointer', padding: 0,
                      transition: 'all var(--dur-fast) var(--ease-standard)',
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Interests */}
            <div className="surface-card" style={{ padding: 'var(--sp-4)' }}>
              <label style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--sp-2)' }}>Interests / Job tags</label>
              <input className="input-field" value={interests} onChange={e => setInterests(e.target.value)} placeholder="plumber, cricket, gardening" />
            </div>
          </section>

          {/* Privacy section */}
          <section className="settings-section" style={{ marginBottom: 'var(--sp-8)' }}>
            <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', marginBottom: 'var(--sp-3)' }}>Privacy</div>

            <div className="surface-card" style={{ padding: 'var(--sp-4)', marginBottom: 'var(--sp-4)' }}>
              <label style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--sp-3)' }}>Location on map</label>
              <SegmentedToggle
                value={locationPrivacy}
                options={[
                  { value: 'visible', label: 'Visible' },
                  { value: 'fuzzed', label: 'Fuzzed' },
                  { value: 'hidden', label: 'Hidden' },
                ]}
                onChange={setLocationPrivacy}
              />
              <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', marginTop: 'var(--sp-2)' }}>
                {locationPrivacy === 'visible' ? 'Others see approximate location (~100m)' :
                 locationPrivacy === 'fuzzed' ? 'Others see approximate location (~240m)' :
                 'You are hidden from everyone'}
              </div>
            </div>

            <div className="surface-card" style={{ padding: 'var(--sp-4)' }}>
              <label style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--sp-3)' }}>Chat requests</label>
              <SegmentedToggle
                value={messagePermission}
                options={[
                  { value: 'everyone', label: 'Everyone' },
                  { value: 'matches', label: 'Shared interests' },
                  { value: 'nobody', label: 'No one' },
                ]}
                onChange={setMessagePermission}
              />
              <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', marginTop: 'var(--sp-2)' }}>
                {messagePermission === 'everyone' ? 'Anyone can send you a chat request' :
                 messagePermission === 'matches' ? 'Only users with matching interests' :
                 'No one can send you requests'}
              </div>
            </div>
          </section>

          <button className="btn btn-primary btn-full" type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save settings'}
          </button>
        </form>

        {/* Pending requests */}
        {pendingRequests.length > 0 && (
          <section className="settings-section" style={{ marginTop: 'var(--sp-8)' }}>
            <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', marginBottom: 'var(--sp-3)' }}>
              Pending requests ({pendingRequests.length})
            </div>
            {pendingRequests.map(req => (
              <div key={req._id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', padding: 'var(--sp-3)', borderRadius: 'var(--radius-md)', background: 'var(--bg)', boxShadow: 'var(--shadow-raised)', marginBottom: 'var(--sp-2)' }}>
                <AvatarIcon category={req.fromUser?.avatarCategory} size={40} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 'var(--fs-sm)', fontWeight: 'var(--fw-medium)', color: 'var(--text-primary)' }}>{req.fromUser?.username}</div>
                  <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>{req.fromUser?.interests?.join(', ')}</div>
                </div>
                <div style={{ display: 'flex', gap: 'var(--sp-1)' }}>
                  <button onClick={() => handleAccept(req._id)}
                    style={{ width: 32, height: 32, borderRadius: '50%', border: 'none', background: 'var(--primary)', color: '#fff', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    ✓
                  </button>
                  <button onClick={() => handleDecline(req._id)}
                    style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--text-muted)', background: 'transparent', color: 'var(--text-muted)', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Logout */}
        <button
          onClick={logout}
          style={{
            width: '100%', padding: 'var(--sp-3)',
            border: 'none', borderRadius: 'var(--radius-sm)',
            fontSize: 'var(--fs-base)', color: 'var(--semantic-danger)',
            background: 'var(--bg)', boxShadow: 'var(--shadow-raised-sm)',
            cursor: 'pointer', fontFamily: 'inherit',
            marginTop: 'var(--sp-8)',
            transition: 'all var(--dur-fast) var(--ease-standard)',
          }}
        >
          Log out
        </button>
      </div>
    </div>
  )
}
