import { useState } from 'react'
import { Link } from 'react-router-dom'
import { IconMail } from '@tabler/icons-react'
import api from '../api/client'

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
      setError(err.response?.data?.error || 'Failed to send reset email')
    } finally { setLoading(false) }
  }

  if (sent) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: 'var(--sp-4)', display: 'flex', justifyContent: 'center' }}>
            <IconMail size={40} style={{ color: 'var(--primary)' }} />
          </div>
          <h1 className="auth-title" style={{ textAlign: 'center' }}>Check your email</h1>
          <p className="auth-subtext" style={{ textAlign: 'center' }}>
            If an account exists for <strong>{email}</strong>, we've sent a password reset link.
            It expires in 30 minutes.
          </p>
          <Link to="/login" className="btn btn-primary" style={{ display: 'inline-block', marginTop: 'var(--sp-4)', textAlign: 'center' }}>
            Back to log in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">reset your password</h1>
        <p className="auth-subtext">
          Enter your email and we'll send you a link to reset your password.
        </p>

        {error && (
          <div className="field-group" style={{ color: 'var(--semantic-danger)', fontSize: 'var(--fs-sm)', textAlign: 'center', background: 'var(--semantic-danger-bg)', padding: 'var(--sp-3) var(--sp-4)', borderRadius: 'var(--radius-sm)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="field-group">
            <label>Email</label>
            <input
              className="input-field"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
        </form>

        <div className="auth-switch" style={{ marginTop: 'var(--sp-4)' }}>
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 'var(--fw-medium)' }}>Back to log in</Link>
        </div>
      </div>
    </div>
  )
}
