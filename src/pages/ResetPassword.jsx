import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { IconAlertTriangle } from '@tabler/icons-react'
import api from '../api/client'
import PasswordChecklist from '../components/PasswordChecklist'

export default function ResetPassword() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [invalidToken, setInvalidToken] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match'); return }
    setError('')
    setLoading(true)
    try {
      await api.post(`/auth/reset-password/${token}`, { password })
      navigate('/login', { state: { reset: true } })
    } catch (err) {
      const msg = err.response?.data?.error || 'Reset failed'
      if (msg.toLowerCase().includes('expired') || msg.toLowerCase().includes('invalid')) {
        setInvalidToken(true)
      }
      setError(msg)
    } finally { setLoading(false) }
  }

  if (invalidToken) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: 'var(--sp-4)', display: 'flex', justifyContent: 'center' }}>
            <IconAlertTriangle size={40} style={{ color: 'var(--semantic-danger)' }} />
          </div>
          <h1 className="auth-title" style={{ textAlign: 'center' }}>Link expired</h1>
          <p className="auth-subtext" style={{ textAlign: 'center' }}>
            This reset link is no longer valid. Request a new one.
          </p>
          <Link to="/forgot-password" className="btn btn-primary" style={{ display: 'inline-block', marginTop: 'var(--sp-4)' }}>
            Request new reset link
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">reset your password</h1>

        {error && (
          <div className="field-group" style={{ color: 'var(--semantic-danger)', fontSize: 'var(--fs-sm)', textAlign: 'center', background: 'var(--semantic-danger-bg)', padding: 'var(--sp-3) var(--sp-4)', borderRadius: 'var(--radius-sm)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="field-group">
            <label>New password</label>
            <input
              className="input-field"
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            {password.length > 0 && <PasswordChecklist password={password} />}
          </div>

          <div className="field-group">
            <label>Confirm new password</label>
            <input
              className="input-field"
              type="password"
              placeholder="Re-enter new password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
            />
          </div>

          <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset password'}
          </button>
        </form>

        <div className="auth-switch" style={{ marginTop: 'var(--sp-4)' }}>
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 'var(--fw-medium)' }}>Back to log in</Link>
        </div>
      </div>
    </div>
  )
}
