import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../api/client'
import PasswordChecklist from '../components/PasswordChecklist'
import theme from '../styles/theme'

export default function ResetPassword() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match'); return }
    setError('')
    setLoading(true)
    try {
      await api.post(`/auth/reset-password/${token}`, { password })
      navigate('/login', { state: { reset: true } })
    } catch (err) {
      setError(err.response?.data?.error || 'Reset failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.wrapper}>
      <div className="form-card" style={styles.card}>
        <h1 style={styles.title}>New password</h1>
        <form onSubmit={handleSubmit}>
          {error && <div style={styles.error}>{error}</div>}
          <input
            style={styles.input}
            type="password"
            placeholder="New password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {password.length > 0 && <PasswordChecklist password={password} />}
          <input
            style={{ ...styles.input, marginTop: theme.spacing.sm }}
            type="password"
            placeholder="Confirm new password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            required
          />
          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset password'}
          </button>
          <div style={styles.links}>
            <Link to="/login" style={styles.link}>Back to login</Link>
          </div>
        </form>
      </div>
    </div>
  )
}

const styles = {
  wrapper: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: theme.bg, padding: theme.spacing.xl },
  card: { width: '100%', maxWidth: 380, padding: 40, borderRadius: theme.radius.xl, background: theme.bg, boxShadow: theme.shadow.card },
  title: { margin: '0 0 24px', fontSize: theme.fontSize.xxl, textAlign: 'center', color: theme.text },
  input: { width: '100%', padding: '14px 16px', border: 'none', borderRadius: theme.radius.md, fontSize: theme.fontSize.md, background: theme.bg, boxShadow: theme.shadow.pressed, outline: 'none', boxSizing: 'border-box', color: theme.text, fontFamily: 'inherit' },
  button: { width: '100%', padding: '14px', border: 'none', borderRadius: theme.radius.md, fontSize: theme.fontSize.lg, fontWeight: 600, color: theme.text, background: theme.bg, boxShadow: theme.shadow.raised, cursor: 'pointer', marginTop: theme.spacing.lg, fontFamily: 'inherit' },
  error: { background: '#fff0f0', color: theme.error, padding: '10px 14px', borderRadius: theme.radius.sm, marginBottom: theme.spacing.md, fontSize: theme.fontSize.sm, textAlign: 'center' },
  links: { textAlign: 'center', marginTop: theme.spacing.xl, fontSize: theme.fontSize.sm },
  link: { color: theme.textSecondary, textDecoration: 'none' },
}
