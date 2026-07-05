import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import theme from '../styles/theme'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      setSent(true)
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.wrapper}>
      <div className="form-card" style={styles.card}>
        <div style={{ textAlign: 'center', fontSize: 36, marginBottom: 12 }}>🔐</div>
        <h1 style={styles.title}>Reset password</h1>

        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <p style={styles.success}>
              If that email exists, a reset link was sent.
            </p>
            <Link to="/login" style={styles.link}>Back to login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <div style={styles.error}>{error}</div>}
            <input
              style={styles.input}
              type="email"
              placeholder="Your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <button style={styles.button} type="submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send reset link'}
            </button>
            <div style={styles.links}>
              <Link to="/login" style={styles.link}>Back to login</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

const styles = {
  wrapper: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: theme.bg, padding: theme.spacing.xl },
  card: { width: '100%', maxWidth: 380, padding: 40, borderRadius: theme.radius.xl, background: theme.bg, boxShadow: theme.shadow.card },
  title: { margin: '0 0 24px', fontSize: theme.fontSize.xxl, textAlign: 'center', color: theme.text },
  input: { width: '100%', padding: '14px 16px', marginBottom: theme.spacing.md, border: 'none', borderRadius: theme.radius.md, fontSize: theme.fontSize.md, background: theme.bg, boxShadow: theme.shadow.pressed, outline: 'none', boxSizing: 'border-box', color: theme.text, fontFamily: 'inherit' },
  button: { width: '100%', padding: '14px', border: 'none', borderRadius: theme.radius.md, fontSize: theme.fontSize.lg, fontWeight: 600, color: theme.text, background: theme.bg, boxShadow: theme.shadow.raised, cursor: 'pointer', fontFamily: 'inherit' },
  error: { background: '#fff0f0', color: theme.error, padding: '10px 14px', borderRadius: theme.radius.sm, marginBottom: theme.spacing.md, fontSize: theme.fontSize.sm, textAlign: 'center' },
  success: { color: theme.success, fontSize: theme.fontSize.md, marginBottom: theme.spacing.lg },
  links: { textAlign: 'center', marginTop: theme.spacing.xl, fontSize: theme.fontSize.sm },
  link: { color: theme.textSecondary, textDecoration: 'none' },
}
