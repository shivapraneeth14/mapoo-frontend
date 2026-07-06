import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          height: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: 'var(--bg)', color: 'var(--text-primary)',
          fontFamily: '-apple-system, sans-serif', padding: 24, textAlign: 'center',
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>&#x26A0;</div>
          <h1 style={{ fontSize: 20, fontWeight: 600, margin: '0 0 8px' }}>Something went wrong</h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: '0 0 24px', maxWidth: 360 }}>
            An unexpected error occurred. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 24px', borderRadius: 8, border: 'none',
              background: 'var(--primary)', color: '#fff', fontSize: 14,
              fontWeight: 500, cursor: 'pointer',
            }}
          >
            Refresh page
          </button>
          {this.state.error && (
            <pre style={{
              marginTop: 24, fontSize: 11, color: 'var(--text-muted)',
              maxWidth: '100%', overflow: 'auto', textAlign: 'left',
              background: 'var(--bg-secondary)', padding: 12, borderRadius: 8,
            }}>
              {this.state.error.message}
            </pre>
          )}
        </div>
      )
    }

    return this.props.children
  }
}
