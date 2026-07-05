import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import theme from '../styles/theme'

const features = [
  {
    emoji: '\u{1F5FA}\uFE0F',
    title: 'See who\u2019s around',
    desc: 'A live map of nearby people and events. No exact location is ever shared.',
  },
  {
    emoji: '\u{1F50D}',
    title: 'Search by interest or job',
    desc: 'Need a plumber, or someone into the same hobby? Just search and find them on the map.',
  },
  {
    emoji: '\u{1F4AC}',
    title: 'Chat, then decide',
    desc: 'Only your username shows. Share more only if you want to.',
  },
  {
    emoji: '\u{1F4C5}',
    title: 'Events and walk-ins',
    desc: 'A pickup game, a walk-in interview \u2014 post it, and people nearby see it.',
  },
]

export default function Landing() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function scrollToFeatures() {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div style={styles.page}>
      <div style={styles.hero}>
        <div style={styles.logoWrap}>
          <span style={styles.logoEmoji}>{'\u{1F5FA}\uFE0F'}</span>
          <span style={styles.logoText}>mapoo</span>
        </div>

        <div style={styles.heroCard}>
          <p style={styles.heroLine} className="landing-hero-line">live in your neighborhood.</p>
          <p style={styles.heroLine} className="landing-hero-line">the electrician on your street.</p>
          <p style={styles.heroLine} className="landing-hero-line">the chess player two doors down.</p>
        </div>

        <p style={styles.heroSub}>
          Most of us have no idea what the people around us actually do, or need.
          See who's nearby, what they're into, and say hello — anonymously,
          until you choose otherwise.
        </p>

        <div style={styles.ctaRow}>
          {user ? (
            <button onClick={() => navigate('/map')} style={styles.ctaPrimary}>
              Go to map {'\u2197'}
            </button>
          ) : (
            <Link to="/signup" style={styles.ctaPrimary}>
              Get started {'\u2197'}
            </Link>
          )}
          <button onClick={scrollToFeatures} style={styles.ctaSecondary}>
            See who's around {'\u2193'}
          </button>
        </div>

        <div style={{
          ...styles.scrollHint,
          opacity: scrolled ? 0 : 0.6,
          transition: 'opacity 0.3s',
        }}>
          <span style={styles.scrollDot} />
        </div>
      </div>

      <div id="features" style={styles.featuresSection}>
        <h2 style={styles.featuresTitle}>How it works</h2>
        <div style={styles.featuresGrid}>
          {features.map((f, i) => (
            <div key={i} style={styles.featureCard}>
              <div style={styles.featureEmoji}>{f.emoji}</div>
              <h3 style={styles.featureTitle}>{f.title}</h3>
              <p style={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>

        <div style={styles.featuresCta}>
          {user ? (
            <button onClick={() => navigate('/map')} style={styles.ctaPrimary}>
              Go to map {'\u2197'}
            </button>
          ) : (
            <Link to="/signup" style={styles.ctaPrimary}>
              Get started {'\u2197'}
            </Link>
          )}
        </div>
      </div>

      <div style={styles.footer}>
        <div style={styles.footerInner}>
          {user ? (
            <button onClick={() => navigate('/map')} style={styles.footerLinkBtn}>
              Go to map
            </button>
          ) : (
            <>
              <span>Already have an account?</span>
              <Link to="/login" style={styles.footerLink}>Log in</Link>
            </>
          )}
        </div>
        <div style={styles.footerPrivacy}>
          Your privacy is built in. No real names, no shared locations, no contact info shown without your consent.
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    background: theme.bg,
    color: theme.text,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  hero: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: `0 ${theme.spacing.xl}px`,
    textAlign: 'center',
    position: 'relative',
  },
  logoWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 48,
  },
  logoEmoji: {
    fontSize: 32,
  },
  logoText: {
    fontSize: theme.fontSize.title,
    fontWeight: 700,
    letterSpacing: 2,
    color: theme.text,
  },
  heroCard: {
    background: theme.bg,
    borderRadius: theme.radius.xl,
    boxShadow: theme.shadow.card,
    padding: '32px 28px',
    marginBottom: theme.spacing.xxl,
    maxWidth: 520,
    width: '100%',
  },
  heroLine: {
    fontSize: theme.fontSize.xl,
    fontWeight: 600,
    lineHeight: 1.6,
    color: theme.text,
    margin: 0,
  },
  heroSub: {
    fontSize: theme.fontSize.md,
    color: theme.textSecondary,
    lineHeight: 1.7,
    maxWidth: 480,
    margin: `0 auto ${theme.spacing.xxl}px`,
  },
  ctaRow: {
    display: 'flex',
    gap: theme.spacing.md,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  ctaPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '14px 32px',
    borderRadius: theme.radius.md,
    background: theme.bg,
    boxShadow: theme.shadow.raised,
    color: theme.text,
    fontSize: theme.fontSize.lg,
    fontWeight: 600,
    border: 'none',
    cursor: 'pointer',
    textDecoration: 'none',
    fontFamily: 'inherit',
    transition: 'all 0.15s',
  },
  ctaSecondary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '14px 32px',
    borderRadius: theme.radius.md,
    background: theme.bg,
    boxShadow: theme.shadow.raisedSm,
    color: theme.textSecondary,
    fontSize: theme.fontSize.md,
    fontWeight: 500,
    border: 'none',
    cursor: 'pointer',
    textDecoration: 'none',
    fontFamily: 'inherit',
    transition: 'all 0.15s',
  },
  scrollHint: {
    position: 'absolute',
    bottom: 32,
    left: '50%',
    transform: 'translateX(-50%)',
  },
  scrollDot: {
    display: 'block',
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: theme.textMuted,
    animation: 'bounce 2s infinite',
  },
  featuresSection: {
    padding: `80px ${theme.spacing.xl}px`,
    maxWidth: 900,
    margin: '0 auto',
  },
  featuresTitle: {
    textAlign: 'center',
    fontSize: theme.fontSize.xxl,
    fontWeight: 700,
    color: theme.text,
    marginBottom: 48,
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: theme.spacing.xxl,
  },
  featureCard: {
    background: theme.bg,
    borderRadius: theme.radius.xl,
    boxShadow: theme.shadow.cardSm,
    padding: '32px 24px',
    textAlign: 'center',
    transition: 'box-shadow 0.2s',
  },
  featureEmoji: {
    fontSize: 40,
    marginBottom: theme.spacing.md,
  },
  featureTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: 600,
    color: theme.text,
    marginBottom: theme.spacing.sm,
  },
  featureDesc: {
    fontSize: theme.fontSize.sm,
    color: theme.textSecondary,
    lineHeight: 1.6,
    margin: 0,
  },
  featuresCta: {
    textAlign: 'center',
    marginTop: 48,
  },
  footer: {
    padding: `40px ${theme.spacing.xl}px`,
    textAlign: 'center',
  },
  footerInner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    fontSize: theme.fontSize.sm,
    color: theme.textSecondary,
    marginBottom: theme.spacing.md,
  },
  footerLink: {
    color: theme.accent,
    fontWeight: 600,
    textDecoration: 'none',
  },
  footerLinkBtn: {
    background: 'none',
    border: 'none',
    color: theme.accent,
    fontWeight: 600,
    fontSize: theme.fontSize.sm,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  footerPrivacy: {
    fontSize: theme.fontSize.xs,
    color: theme.textMuted,
    maxWidth: 400,
    margin: '0 auto',
    lineHeight: 1.5,
  },
}
