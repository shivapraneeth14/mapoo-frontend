const theme = {
  bg: '#e8e8e8',
  bgDark: '#d1d1d1',
  bgLight: '#ffffff',
  text: '#333',
  textSecondary: '#888',
  textMuted: '#bbb',
  accent: '#4f46e5',
  accentDark: '#3b3b9e',
  success: '#4caf50',
  error: '#d32f2f',
  warning: '#ff9800',

  radius: {
    sm: 10,
    md: 12,
    lg: 14,
    xl: 20,
    round: '50%',
  },

  shadow: {
    raised: '6px 6px 12px #d1d1d1, -6px -6px 12px #ffffff',
    raisedSm: '4px 4px 8px #d1d1d1, -4px -4px 8px #ffffff',
    pressed: 'inset 3px 3px 6px #d1d1d1, inset -3px -3px 6px #ffffff',
    pressedSm: 'inset 2px 2px 4px #d1d1d1, inset -2px -2px 4px #ffffff',
    card: '20px 20px 40px #c8c8c8, -20px -20px 40px #ffffff',
    cardSm: '10px 10px 20px #d1d1d1, -10px -10px 20px #ffffff',
    glow: (color) => `0 0 0 3px white, 0 0 12px ${color}`,
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
  },

  fontSize: {
    xs: 12,
    sm: 13,
    md: 14,
    lg: 16,
    xl: 20,
    xxl: 24,
    title: 32,
  },
}

export function neumorphicCard(radius = theme.radius.xl) {
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
