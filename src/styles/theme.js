const theme = {
  /* Surface */
  bg: '#ECEAE6',
  bgDark: '#D9D7D2',
  bgLight: '#FFFFFF',
  bgSurface: '#ECEAE6',

  /* Brand */
  accent: '#0F6E56',
  accentDark: '#085041',
  coral: '#D85A30',
  coralDark: '#993C1D',

  /* Semantic */
  semanticPeople: '#3B6D11',
  semanticPeopleBg: '#EAF3DE',
  semanticJob: '#854F0B',
  semanticJobBg: '#FAEEDA',
  semanticDanger: '#A32D2D',
  semanticDangerBg: '#FCEBEB',
  success: '#3B6D11',
  error: '#A32D2D',
  warning: '#854F0B',

  /* Text */
  text: '#23241F',
  textPrimary: '#23241F',
  textSecondary: '#6B6A65',
  textMuted: '#9A988F',
  textOnPrimary: '#FFFFFF',
  textOnAccent: '#FFFFFF',

  /* Radius */
  radius: {
    sm: 10,
    md: 14,
    lg: 20,
    xl: 20,
    round: '50%',
    pill: '999px',
  },

  /* Shadows */
  shadow: {
    raised: '6px 6px 12px rgba(163,161,155,0.5), -6px -6px 12px rgba(255,255,255,0.8)',
    raisedSm: '3px 3px 6px rgba(163,161,155,0.4), -3px -3px 6px rgba(255,255,255,0.7)',
    pressed: 'inset 4px 4px 8px rgba(163,161,155,0.5), inset -4px -4px 8px rgba(255,255,255,0.8)',
    pressedSm: 'inset 2px 2px 4px rgba(163,161,155,0.4), inset -2px -2px 4px rgba(255,255,255,0.7)',
    card: '4px 4px 10px rgba(163,161,155,0.35), -4px -4px 10px rgba(255,255,255,0.6)',
    cardSm: '2px 2px 6px rgba(163,161,155,0.3), -2px -2px 6px rgba(255,255,255,0.5)',
    glow: (color) => `0 0 0 3px ${color}15`,
    glowPrimary: '0 0 0 3px rgba(15,110,86,0.15)',
    glowDanger: '0 0 0 3px rgba(163,42,42,0.15)',
  },

  /* Spacing */
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    sp1: 4,
    sp2: 8,
    sp3: 12,
    sp4: 16,
    sp6: 24,
    sp8: 32,
    sp12: 48,
  },

  /* Font size */
  fontSize: {
    xs: 12,
    sm: 13,
    md: 14,
    lg: 16,
    xl: 20,
    xxl: 24,
    title: 32,
    base: 14,
  },
}

export function neumorphicCard(radius = theme.radius.lg) {
  return {
    background: theme.bg,
    borderRadius: radius,
    boxShadow: theme.shadow.card,
  }
}

export function neumorphicButton(pressed = false) {
  return {
    border: 'none',
    borderRadius: theme.radius.md,
    background: theme.bg,
    boxShadow: pressed ? theme.shadow.pressed : theme.shadow.raised,
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 0.15s',
  }
}

export function neumorphicInput() {
  return {
    border: 'none',
    borderRadius: theme.radius.md,
    background: theme.bg,
    boxShadow: theme.shadow.pressed,
    outline: 'none',
    fontFamily: 'inherit',
    color: theme.text,
  }
}

export default theme
