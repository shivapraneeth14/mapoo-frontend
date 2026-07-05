import theme from '../styles/theme'

const ICON_MAP = {
  plumber: '\u{1F527}', cricket: '\u{1F3CF}', gardening: '\u{1F331}',
  gardener: '\u{1F331}', landscaping: '\u{1F33F}', cooking: '\u{1F373}',
  cook: '\u{1F373}', baking: '\u{1F956}', chef: '\u{1F468}\u200D\u{1F373}',
  photography: '\u{1F4F7}', photographer: '\u{1F4F7}', art: '\u{1F3A8}',
  artist: '\u{1F3A8}', sports: '\u{26BD}', teacher: '\u{1F4DA}',
  teaching: '\u{1F4DA}', doctor: '\u{1FA7A}', medical: '\u{1FA7A}',
  nurse: '\u{1F489}', music: '\u{1F3B5}', musician: '\u{1F3B5}',
  fitness: '\u{1F4AA}', trainer: '\u{1F4AA}', yoga: '\u{1F9D8}',
  driver: '\u{1F697}', electrician: '\u{26A1}', painter: '\u{1F3A8}',
  carpenter: '\u{1FA9F}', welding: '\u{1F529}', mechanic: '\u{1F527}',
  cleaning: '\u{1F9F9}', default: '\u{1F464}',
}

const seen = new Set()
export const AVATAR_OPTIONS = Object.entries(ICON_MAP)
  .filter(([key, emoji]) => {
    if (seen.has(emoji)) return false
    seen.add(emoji)
    return true
  })
  .map(([label, emoji]) => ({ label, emoji }))

export function getIcon(category) {
  if (!category) return ICON_MAP.default
  const key = category.toLowerCase().trim()
  return ICON_MAP[key] || ICON_MAP.default
}

export default function AvatarIcon({ category, size = 40 }) {
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: size * 0.48,
      background: theme.bg,
      boxShadow: theme.shadow.raisedSm,
      flexShrink: 0,
      transition: 'all 0.15s',
    }}>
      {getIcon(category)}
    </div>
  )
}
