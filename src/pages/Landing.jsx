import { useNavigate } from 'react-router-dom'
import { IconShieldCheck } from '@tabler/icons-react'
import { useAuth } from '../context/AuthContext'

const features = [
  {
    emoji: '👥',
    bg: 'rgba(255, 159, 67, 0.15)',
    color: '#FF9F43',
    title: "See who's around",
    desc: 'Live map of nearby people and events. Your location is fuzzed.',
  },
  {
    emoji: '🔍',
    bg: 'rgba(0, 210, 211, 0.15)',
    color: '#00D2D3',
    title: 'Search by interest',
    desc: 'Need a plumber or a chess partner? Find them nearby.',
  },
  {
    emoji: '💬',
    bg: 'rgba(108, 92, 231, 0.15)',
    color: '#6C5CE7',
    title: 'Chat, then decide',
    desc: 'Your username only. Send a request, chat if accepted.',
  },
  {
    emoji: '📅',
    bg: 'rgba(255, 107, 107, 0.15)',
    color: '#FF6B6B',
    title: 'Post events',
    desc: 'A pickup game or walk-in interview — post and people see it.',
  },
]

export default function Landing() {
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="landing-page-new">
      <div className="landing-bg-shape">
        <div className="landing-blob landing-blob-1" />
        <div className="landing-blob landing-blob-2" />
        <div className="landing-blob landing-blob-3" />
        <div className="landing-blob landing-blob-4" />
        <div className="landing-bg-overlay" />
      </div>

      <div className="landing-logo"><span className="landing-logo-emoji">🗺️</span><span className="landing-logo-text">mapoo</span></div>

      <div className="landing-glass-card">
        <div className="landing-badge">
          live in your neighborhood
        </div>

        <h1 className="landing-headline">
          Find who's around you —<br />and what they bring
        </h1>

        <p className="landing-subtext">
          See who's nearby, what they're into, and say hello — anonymously, until you choose otherwise.
        </p>

        <button className="btn btn-primary landing-cta" onClick={() => navigate(user ? '/map' : '/signup')}>
          {user ? 'Go to map' : 'Get started'}
        </button>

        <div className="landing-features">
          {features.map((f, i) => (
            <div key={i} className="landing-feature-item">
              <div className="landing-feature-pic" style={{ background: f.bg, color: f.color }}>
                <span>{f.emoji}</span>
              </div>
              <div className="landing-feature-title">{f.title}</div>
              <div className="landing-feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>

        <div className="landing-privacy">
          <IconShieldCheck size={14} />
          No real names, no shared locations, no contact info without consent.
        </div>
      </div>
    </div>
  )
}
