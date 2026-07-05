import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import theme from '../styles/theme'

function isOnboarded() {
  return localStorage.getItem('mapoo_onboarded') === 'true'
}

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate(isOnboarded() ? '/map' : '/onboarding', { replace: true })
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.wrapper}>
      <div className="form-card" style={styles.card}>
        <div style={styles.logo}>🗺️</div>
        <h1 style={styles.title}>mapoo</h1>
        <p style={styles.subtitle}>Find skills near you</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            style={styles.input}
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            required
          />
          <div style={{ position: 'relative' }}>
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
          <button
            style={styles.button}
            type="submit"
            disabled={loading}
            onMouseDown={e => e.currentTarget.style.boxShadow = theme.shadow.pressed}
            onMouseUp={e => e.currentTarget.style.boxShadow = theme.shadow.raised}
          >
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <div style={styles.links}>
          <Link to="/signup" style={styles.link}>Create account</Link>
          <Link to="/forgot-password" style={styles.link}>Forgot password?</Link>
        </div>
      </div>
    </div>
  )
}

const styles = {
  wrapper: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: theme.bg,
    padding: theme.spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    padding: 40,
    borderRadius: theme.radius.xl,
    background: theme.bg,
    boxShadow: theme.shadow.card,
  },
  logo: {
    textAlign: 'center',
    fontSize: 40,
    marginBottom: 8,
  },
  title: {
    margin: 0,
    fontSize: theme.fontSize.title,
    textAlign: 'center',
    color: theme.text,
    letterSpacing: 2,
    fontWeight: 700,
  },
  subtitle: {
    textAlign: 'center',
    color: theme.textSecondary,
    marginTop: 4,
    marginBottom: 28,
    fontSize: theme.fontSize.md,
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    marginBottom: theme.spacing.md,
    border: 'none',
    borderRadius: theme.radius.md,
    fontSize: theme.fontSize.md,
    background: theme.bg,
    boxShadow: theme.shadow.pressed,
    outline: 'none',
    boxSizing: 'border-box',
    color: theme.text,
    fontFamily: 'inherit',
    transition: 'box-shadow 0.2s',
  },
  button: {
    width: '100%',
    padding: '14px',
    border: 'none',
    borderRadius: theme.radius.md,
    fontSize: theme.fontSize.lg,
    fontWeight: 600,
    color: theme.text,
    background: theme.bg,
    boxShadow: theme.shadow.raised,
    cursor: 'pointer',
    marginTop: theme.spacing.sm,
    fontFamily: 'inherit',
    transition: 'all 0.15s',
  },
  error: {
    background: '#fff0f0',
    color: theme.error,
    padding: '10px 14px',
    borderRadius: theme.radius.sm,
    marginBottom: theme.spacing.md,
    fontSize: theme.fontSize.sm,
    textAlign: 'center',
    border: '1px solid rgba(211,47,47,0.15)',
  },
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
  links: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: theme.spacing.xl,
    fontSize: theme.fontSize.sm,
  },
  link: {
    color: theme.textSecondary,
    textDecoration: 'none',
    transition: 'color 0.2s',
  },
}
