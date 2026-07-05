import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import PasswordChecklist from '../components/PasswordChecklist'
import api from '../api/client'
import theme from '../styles/theme'

export default function Signup() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', username: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [usernameAvailable, setUsernameAvailable] = useState(null)
  const [checkingUsername, setCheckingUsername] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    if (form.username.length < 3) {
      setUsernameAvailable(null)
      return
    }
    setCheckingUsername(true)
    const timer = setTimeout(async () => {
      try {
        const res = await api.get(`/auth/check-username/${encodeURIComponent(form.username)}`)
        setUsernameAvailable(res.data.available)
      } catch {
        setUsernameAvailable(null)
      } finally {
        setCheckingUsername(false)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [form.username])

  function validate() {
    const e = {}
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email format'
    if (form.username.length < 3 || form.username.length > 20) e.username = 'Must be 3-20 characters'
    if (!/^[a-zA-Z0-9_]+$/.test(form.username)) e.username = 'Letters, numbers, and underscores only'
    if (usernameAvailable === false) e.username = 'Username already taken'
    if (form.password.length < 8) e.password = 'At least 8 characters'
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await signup({ email: form.email, username: form.username, password: form.password })
      navigate('/onboarding', { replace: true })
    } catch (err) {
      const data = err.response?.data
      if (data?.field) setErrors(prev => ({ ...prev, [data.field]: data.error }))
      else setErrors(prev => ({ ...prev, general: data?.error || 'Signup failed' }))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.wrapper}>
      <div className="form-card" style={styles.card}>
        <h1 style={styles.title}>Create account</h1>
        <p style={styles.subtitle}>Join mapoo</p>

        {errors.general && <div style={styles.error}>{errors.general}</div>}

        <form onSubmit={handleSubmit}>
          <input
            style={{ ...styles.input, marginBottom: errors.email ? 4 : theme.spacing.md }}
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            required
          />
          {errors.email && <div style={styles.fieldError}>{errors.email}</div>}

          <div style={{ position: 'relative', marginBottom: errors.username ? 4 : theme.spacing.md }}>
            <input
              style={styles.input}
              type="text"
              placeholder="Username"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              required
            />
            {checkingUsername && <span style={styles.checking}>checking...</span>}
            {!checkingUsername && usernameAvailable === true && form.username.length >= 3 && (
              <span style={{ ...styles.indicator, color: theme.success }}>✓ available</span>
            )}
            {!checkingUsername && usernameAvailable === false && form.username.length >= 3 && (
              <span style={{ ...styles.indicator, color: theme.error }}>✕ taken</span>
            )}
          </div>
          {errors.username && <div style={styles.fieldError}>{errors.username}</div>}

          <div style={{ position: 'relative', marginBottom: errors.password ? 4 : theme.spacing.sm }}>
            <input
              style={{ ...styles.input, paddingRight: 44 }}
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />
            <button
              type="button"
              style={styles.eyeBtn}
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={theme.textSecondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                  <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={theme.textSecondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          </div>
          {form.password.length > 0 && <PasswordChecklist password={form.password} />}
          {errors.password && <div style={styles.fieldError}>{errors.password}</div>}

          <div style={{ position: 'relative', marginBottom: errors.confirmPassword ? 4 : theme.spacing.md }}>
            <input
              style={{ ...styles.input, paddingRight: 44 }}
              type={showConfirm ? 'text' : 'password'}
              placeholder="Confirm password"
              value={form.confirmPassword}
              onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
              required
            />
            <button
              type="button"
              style={styles.eyeBtn}
              onClick={() => setShowConfirm(!showConfirm)}
              tabIndex={-1}
            >
              {showConfirm ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={theme.textSecondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                  <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={theme.textSecondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          </div>
          {errors.confirmPassword && <div style={styles.fieldError}>{errors.confirmPassword}</div>}

          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <div style={styles.links}>
          <Link to="/login" style={styles.link}>Already have an account? Log in</Link>
        </div>
      </div>
    </div>
  )
}

const styles = {
  wrapper: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: theme.bg, padding: theme.spacing.xl },
  card: { width: '100%', maxWidth: 380, padding: 40, borderRadius: theme.radius.xl, background: theme.bg, boxShadow: theme.shadow.card },
  title: { margin: 0, fontSize: theme.fontSize.xxl, textAlign: 'center', color: theme.text },
  subtitle: { textAlign: 'center', color: theme.textSecondary, marginTop: 4, marginBottom: theme.spacing.xxl, fontSize: theme.fontSize.md },
  input: { width: '100%', padding: '14px 16px', border: 'none', borderRadius: theme.radius.md, fontSize: theme.fontSize.md, background: theme.bg, boxShadow: theme.shadow.pressed, outline: 'none', boxSizing: 'border-box', color: theme.text, fontFamily: 'inherit', transition: 'box-shadow 0.2s' },
  button: { width: '100%', padding: '14px', border: 'none', borderRadius: theme.radius.md, fontSize: theme.fontSize.lg, fontWeight: 600, color: theme.text, background: theme.bg, boxShadow: theme.shadow.raised, cursor: 'pointer', marginTop: theme.spacing.md, fontFamily: 'inherit' },
  error: { background: '#fff0f0', color: theme.error, padding: '10px 14px', borderRadius: theme.radius.sm, marginBottom: theme.spacing.md, fontSize: theme.fontSize.sm, textAlign: 'center', border: '1px solid rgba(211,47,47,0.15)' },
  fieldError: { color: theme.error, fontSize: theme.fontSize.xs, marginBottom: theme.spacing.sm, marginLeft: 4 },
  checking: { position: 'absolute', right: 12, top: 14, fontSize: theme.fontSize.xs, color: theme.textMuted },
  indicator: { position: 'absolute', right: 12, top: 14, fontSize: theme.fontSize.xs, fontWeight: 600 },
  links: { textAlign: 'center', marginTop: theme.spacing.xl, fontSize: theme.fontSize.sm },
  link: { color: theme.textSecondary, textDecoration: 'none' },
  eyeBtn: {
    position: 'absolute',
    right: 8,
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.sm,
    color: theme.textSecondary,
    opacity: 0.7,
  },
}
