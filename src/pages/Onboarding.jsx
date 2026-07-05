import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import theme from '../styles/theme'

const screens = [
  {
    emoji: '\u{1F5FA}\uFE0F',
    title: 'See who\u2019s nearby',
    desc: 'A live map of people and events around you. Your exact location is never shared \u2014 everything is fuzzed for privacy.',
  },
  {
    emoji: '\u{1F50D}',
    title: 'Find your people',
    desc: 'Search by interest or job \u2014 plumber, cricket, chess. Matching people appear right on the map.',
  },
  {
    emoji: '\u{1F4AC}',
    title: 'Anonymous chat',
    desc: 'Only your username shows. Chat requires mutual acceptance. Share your name or contact only if you want to.',
  },
]

export default function Onboarding() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (!loading && !user) navigate('/login', { replace: true })
  }, [user, loading, navigate])

  if (loading) return null

  function handleNext() {
    if (step < screens.length - 1) {
      setStep(s => s + 1)
    } else {
      complete()
    }
  }

  function complete() {
    localStorage.setItem('mapoo_onboarded', 'true')
    navigate('/map', { replace: true })
  }

  function skip() {
    complete()
  }

  const s = screens[step]
  const isLast = step === screens.length - 1

  return (
    <div style={styles.page}>
      <button onClick={skip} style={styles.skip}>Skip</button>

      <div style={styles.content}>
        <div style={styles.emojiWrap}>
          <span style={styles.emoji}>{s.emoji}</span>
        </div>
        <h1 style={styles.title}>{s.title}</h1>
        <p style={styles.desc}>{s.desc}</p>
      </div>

      <div style={styles.bottom}>
        <div style={styles.dots}>
          {screens.map((_, i) => (
            <span key={i} style={{
              ...styles.dot,
              background: i === step ? theme.accent : theme.textMuted,
              width: i === step ? 24 : 8,
              borderRadius: 4,
            }} />
          ))}
        </div>

        <div style={styles.actions}>
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)} style={styles.backBtn}>
              Back
            </button>
          )}
          <button onClick={handleNext} style={styles.nextBtn}>
            {isLast ? 'Get started' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    background: theme.bg,
    display: 'flex',
    flexDirection: 'column',
    padding: `48px ${theme.spacing.xl}px ${theme.spacing.xl}px`,
    position: 'relative',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  skip: {
    position: 'absolute',
    top: 16,
    right: 16,
    background: 'none',
    border: 'none',
    color: theme.textSecondary,
    fontSize: theme.fontSize.sm,
    fontWeight: 500,
    cursor: 'pointer',
    padding: `${theme.spacing.sm}px ${theme.spacing.md}px`,
    fontFamily: 'inherit',
    borderRadius: theme.radius.sm,
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    maxWidth: 400,
    margin: '0 auto',
  },
  emojiWrap: {
    width: 120,
    height: 120,
    borderRadius: theme.radius.xl,
    background: theme.bg,
    boxShadow: theme.shadow.card,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  emoji: {
    fontSize: 56,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: 700,
    color: theme.text,
    marginBottom: theme.spacing.md,
  },
  desc: {
    fontSize: theme.fontSize.md,
    color: theme.textSecondary,
    lineHeight: 1.7,
  },
  bottom: {
    paddingTop: theme.spacing.xl,
  },
  dots: {
    display: 'flex',
    justifyContent: 'center',
    gap: 6,
    marginBottom: theme.spacing.xxl,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    transition: 'all 0.3s',
  },
  actions: {
    display: 'flex',
    gap: theme.spacing.md,
    justifyContent: 'center',
  },
  backBtn: {
    padding: '14px 24px',
    borderRadius: theme.radius.md,
    background: theme.bg,
    boxShadow: theme.shadow.raisedSm,
    border: 'none',
    color: theme.textSecondary,
    fontSize: theme.fontSize.md,
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 0.15s',
  },
  nextBtn: {
    padding: '14px 36px',
    borderRadius: theme.radius.md,
    background: theme.bg,
    boxShadow: theme.shadow.raised,
    border: 'none',
    color: theme.text,
    fontSize: theme.fontSize.lg,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 0.15s',
    minWidth: 140,
  },
}
