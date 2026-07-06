import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { IconEye, IconEyeOff } from '@tabler/icons-react'
import { useAuth } from '../context/AuthContext'

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
    <div className="auth-page">
      <div className="auth-card">
        <p className="auth-eyebrow">welcome back</p>
        <h1 className="auth-title">log in</h1>

        {error && <div className="field-group" style={{ color: 'var(--semantic-danger)', fontSize: 'var(--fs-sm)', textAlign: 'center', background: 'var(--semantic-danger-bg)', padding: 'var(--sp-3) var(--sp-4)', borderRadius: 'var(--radius-sm)' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              className="input-field"
              type="email"
              placeholder="your@email.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="field-group">
            <label htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                className="input-field"
                style={{ paddingRight: 44 }}
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
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
          </div>

          <Link to="/forgot-password" className="forgot-link" style={{
            fontSize: 'var(--fs-sm)', color: 'var(--primary)',
            textAlign: 'right', display: 'block', margin: 'calc(-1 * var(--sp-2)) 0 var(--sp-6)',
          }}>
            Forgot password?
          </Link>

          <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <div className="auth-switch" style={{ marginTop: 'var(--sp-4)' }}>
          Don't have an account? <Link to="/signup">Sign up</Link>
        </div>
      </div>
    </div>
  )
}
