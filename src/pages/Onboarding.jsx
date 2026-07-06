import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconMap2, IconSearch, IconMessageCircle } from '@tabler/icons-react'
import { useAuth } from '../context/AuthContext'

const slides = [
  {
    icon: IconMap2,
    iconTint: 'people',
    title: "See who's nearby",
    desc: 'A live map of people and events around you. Your exact location is never shared — everything is fuzzed for privacy.',
  },
  {
    icon: IconSearch,
    iconTint: 'job',
    title: 'Find your people',
    desc: 'Search by interest or job — plumber, cricket, chess. Matching people appear right on the map.',
  },
  {
    icon: IconMessageCircle,
    iconTint: 'primary',
    title: 'Anonymous chat',
    desc: 'Only your username shows. Chat requires mutual acceptance. Share your name or contact only if you want to.',
  },
]

export default function Onboarding() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const trackRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (!loading && !user) navigate('/login', { replace: true })
  }, [user, loading, navigate])

  const syncIndex = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    const idx = Math.round(el.scrollLeft / el.clientWidth)
    setActiveIndex(idx)
  }, [])

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    el.addEventListener('scroll', syncIndex, { passive: true })
    return () => el.removeEventListener('scroll', syncIndex)
  }, [syncIndex])

  function scrollTo(i) {
    trackRef.current?.children[i]?.scrollIntoView({ behavior: 'smooth', inline: 'start' })
  }

  function handleNext() {
    if (activeIndex < slides.length - 1) {
      scrollTo(activeIndex + 1)
    } else {
      complete()
    }
  }

  function complete() {
    localStorage.setItem('mapoo_onboarded', 'true')
    navigate('/map', { replace: true })
  }

  if (loading || !user) return null

  const isLast = activeIndex === slides.length - 1

  return (
    <div className="onboarding-page">
      <button className="onboarding-skip" onClick={complete}>Skip</button>

      <div className="carousel-track" ref={trackRef}>
        {slides.map((s, i) => (
          <div key={i} className="slide">
            <div className={`slide-icon slide-icon-${s.iconTint}`}>
              <s.icon size={64} />
            </div>
            <h2>{s.title}</h2>
            <p>{s.desc}</p>
          </div>
        ))}
      </div>

      <div className="carousel-bottom">
        <div className="dot-indicators">
          {slides.map((_, i) => (
            <span key={i} className={`dot ${i === activeIndex ? 'active' : ''}`} />
          ))}
        </div>

        <button className="btn btn-primary" onClick={handleNext}>
          {isLast ? 'Get started' : 'Next'}
        </button>
      </div>
    </div>
  )
}
