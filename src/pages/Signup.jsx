import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { IconEye, IconEyeOff, IconLoader2, IconCircleCheckFilled, IconX } from '@tabler/icons-react'
import { useAuth } from '../context/AuthContext'
import PasswordChecklist from '../components/PasswordChecklist'
import { getIcon } from '../components/AvatarIcon'
import api from '../api/client'

const avatarOptions = [
  'default', 'plumber', 'cricket', 'gardening', 'cooking',
  'photography', 'sports', 'music', 'fitness', 'art',
  'doctor', 'teacher', 'electrician', 'driver', 'carpenter',
  'mechanic', 'painter', 'yoga', 'chef', 'cleaning',
]

export default function Signup() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ email: '', username: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [usernameAvailable, setUsernameAvailable] = useState(null)
  const [checkingUsername, setCheckingUsername] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  // Step 2 state
  const [avatarCategory, setAvatarCategory] = useState('')
  const [interests, setInterests] = useState([])
  const [interestInput, setInterestInput] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)

  // Debounced username check
  useEffect(() => {
    if (form.username.length < 3) { setUsernameAvailable(null); return }
    setCheckingUsername(true)
    const timer = setTimeout(async () => {
      try {
        const res = await api.get(`/auth/check-username/${encodeURIComponent(form.username)}`)
        setUsernameAvailable(res.data.available)
      } catch { setUsernameAvailable(null) }
      finally { setCheckingUsername(false) }
    }, 400)
    return () => clearTimeout(timer)
  }, [form.username])

  function validateStep1() {
    const e = {}
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email format'
    if (form.username.length < 3 || form.username.length > 20) e.username = 'Must be 3–20 characters'
    if (!/^[a-zA-Z0-9_]+$/.test(form.username)) e.username = 'Letters, numbers, underscores only'
    if (usernameAvailable === false) e.username = 'Username already taken'
    if (form.password.length < 8) e.password = 'At least 8 characters'
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleStep1(e) {
    e.preventDefault()
    if (!validateStep1()) return
    setLoading(true)
    try {
      await signup({ email: form.email, username: form.username, password: form.password })
      setStep(2)
    } catch (err) {
      const data = err.response?.data
      if (data?.field) setErrors(prev => ({ ...prev, [data.field]: data.error }))
      else setErrors(prev => ({ ...prev, general: data?.error || 'Signup failed' }))
    } finally { setLoading(false) }
  }

  async function handleStartExploring() {
    setSavingProfile(true)
    try {
      await api.patch('/users/me', {
        avatarCategory: avatarCategory || 'default',
        interests,
      })
    } catch { /* silent — non-critical */ }
    setSavingProfile(false)
    navigate('/onboarding', { replace: true })
  }

  function handleSkip() {
    navigate('/onboarding', { replace: true })
  }

  function addInterest(tag) {
    const t = tag.trim().toLowerCase()
    if (t && !interests.includes(t)) {
      setInterests(prev => [...prev, t])
    }
    setInterestInput('')
  }

  function removeInterest(tag) {
    setInterests(prev => prev.filter(t => t !== tag))
  }

  function handleInterestKey(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addInterest(interestInput)
    }
  }

  if (step === 2) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1 className="auth-title">who should we introduce you to?</h1>
          <p className="auth-subtext" style={{ marginBottom: 'var(--sp-6)', fontSize: 'var(--fs-sm)' }}>
            You can change this anytime in settings
          </p>

          <div style={{ marginBottom: 'var(--sp-6)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 'var(--sp-2)' }}>
              {avatarOptions.map(key => {
                const selected = (avatarCategory || 'default') === key
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setAvatarCategory(key)}
                    style={{
                      width: 48, height: 48, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 22, border: selected ? '2px solid var(--primary)' : 'none',
                      background: 'var(--bg)',
                      boxShadow: selected ? 'var(--shadow-pressed)' : 'var(--shadow-raised-sm)',
                      cursor: 'pointer', padding: 0, margin: '0 auto',
                      transition: 'all var(--dur-fast) var(--ease-standard)',
                    }}
                  >
                    {getIcon(key)}
                  </button>
                )
              })}
            </div>
          </div>

          <div style={{ marginBottom: 'var(--sp-6)' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-2)', marginBottom: 'var(--sp-2)' }}>
              {interests.map(tag => (
                <span key={tag} className="animate-scale-pop" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 'var(--sp-1)',
                  padding: 'var(--sp-1) var(--sp-3)',
                  borderRadius: 'var(--radius-pill)', fontSize: 'var(--fs-sm)',
                  background: 'color-mix(in srgb, var(--primary) 10%, var(--bg))',
                  color: 'var(--primary-dark)',
                }}>
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeInterest(tag)}
                    style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: 'var(--text-muted)' }}
                  >
                    <IconX size={14} />
                  </button>
                </span>
              ))}
            </div>
            <input
              className="input-field"
              style={{ height: 40, fontSize: 'var(--fs-sm)' }}
              type="text"
              placeholder="Type an interest and press Enter (e.g., plumber, chess, yoga)"
              value={interestInput}
              onChange={e => setInterestInput(e.target.value)}
              onKeyDown={handleInterestKey}
            />
          </div>

          <button
            className="btn btn-primary btn-full"
            onClick={handleStartExploring}
            disabled={savingProfile}
            style={{ marginBottom: 'var(--sp-3)' }}
          >
            {savingProfile ? 'Saving...' : 'Start exploring'}
          </button>

          <button
            className="btn-ghost"
            onClick={handleSkip}
            style={{ display: 'block', margin: '0 auto', color: 'var(--text-muted)', fontSize: 'var(--fs-sm)', cursor: 'pointer' }}
          >
            Skip for now
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">create your account</h1>

        {errors.general && (
          <div className="field-group" style={{ color: 'var(--semantic-danger)', fontSize: 'var(--fs-sm)', textAlign: 'center', background: 'var(--semantic-danger-bg)', padding: 'var(--sp-3) var(--sp-4)', borderRadius: 'var(--radius-sm)' }}>
            {errors.general}
          </div>
        )}

        <form onSubmit={handleStep1}>
          <div className="field-group">
            <label>Email</label>
            <input
              className="input-field"
              type="email"
              placeholder="your@email.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
            {errors.email && <div style={{ color: 'var(--semantic-danger)', fontSize: 'var(--fs-xs)', marginTop: 'var(--sp-1)' }}>{errors.email}</div>}
          </div>

          <div className="field-group">
            <label>Username</label>
            <div style={{ position: 'relative' }}>
              <input
                className="input-field"
                type="text"
                placeholder="Choose a username"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                required
              />
              <div style={{ position: 'absolute', right: 'var(--sp-3)', top: 0, bottom: 0, display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
                {checkingUsername && <IconLoader2 size={16} className="spinner" style={{ color: 'var(--text-muted)' }} />}
                {!checkingUsername && usernameAvailable === true && form.username.length >= 3 && (
                  <IconCircleCheckFilled size={16} style={{ color: 'var(--semantic-people)' }} />
                )}
                {!checkingUsername && usernameAvailable === false && form.username.length >= 3 && (
                  <IconX size={16} style={{ color: 'var(--semantic-danger)' }} />
                )}
              </div>
            </div>
            {!checkingUsername && usernameAvailable === true && form.username.length >= 3 && (
              <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--semantic-people)', marginTop: 'var(--sp-1)' }}>username available</div>
            )}
            {!checkingUsername && usernameAvailable === false && form.username.length >= 3 && (
              <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--semantic-danger)', marginTop: 'var(--sp-1)' }}>username taken</div>
            )}
            {errors.username && <div style={{ color: 'var(--semantic-danger)', fontSize: 'var(--fs-xs)', marginTop: 'var(--sp-1)' }}>{errors.username}</div>}
          </div>

          <div className="field-group">
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                className="input-field"
                style={{ paddingRight: 44 }}
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                style={{
                  position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 24, height: 24, color: 'var(--text-muted)',
                }}
              >
                {showPassword ? <IconEyeOff size={20} /> : <IconEye size={20} />}
              </button>
            </div>
            {form.password.length > 0 && <PasswordChecklist password={form.password} />}
            {errors.password && <div style={{ color: 'var(--semantic-danger)', fontSize: 'var(--fs-xs)', marginTop: 'var(--sp-1)' }}>{errors.password}</div>}
          </div>

          <div className="field-group">
            <label>Confirm password</label>
            <div style={{ position: 'relative' }}>
              <input
                className="input-field"
                style={{ paddingRight: 44 }}
                type={showConfirm ? 'text' : 'password'}
                placeholder="Re-enter your password"
                value={form.confirmPassword}
                onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                tabIndex={-1}
                style={{
                  position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 24, height: 24, color: 'var(--text-muted)',
                }}
              >
                {showConfirm ? <IconEyeOff size={20} /> : <IconEye size={20} />}
              </button>
            </div>
            {errors.confirmPassword && <div style={{ color: 'var(--semantic-danger)', fontSize: 'var(--fs-xs)', marginTop: 'var(--sp-1)' }}>{errors.confirmPassword}</div>}
          </div>

          <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Continue'}
          </button>
        </form>

        <div className="auth-switch" style={{ marginTop: 'var(--sp-4)' }}>
          Already have an account? <Link to="/login">Log in</Link>
        </div>
      </div>
    </div>
  )
}
