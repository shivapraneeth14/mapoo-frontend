import theme from '../styles/theme'

export default function PasswordChecklist({ password }) {
  const rules = [
    { label: 'At least 8 characters', test: v => v.length >= 8 },
    { label: 'Uppercase letter', test: v => /[A-Z]/.test(v) },
    { label: 'A number', test: v => /[0-9]/.test(v) },
    { label: 'A symbol', test: v => /[^a-zA-Z0-9]/.test(v) },
  ]

  return (
    <div style={{
      fontSize: theme.fontSize.xs,
      marginBottom: theme.spacing.md,
      padding: '8px 12px',
      background: theme.bg,
      borderRadius: theme.radius.sm,
      boxShadow: theme.shadow.pressedSm,
    }}>
      {rules.map(rule => {
        const pass = rule.test(password)
        return (
          <div
            key={rule.label}
            style={{
              color: pass ? theme.success : theme.textMuted,
              marginBottom: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'color 0.2s',
            }}
          >
            <span style={{ fontSize: 11 }}>{pass ? '✓' : '○'}</span>
            <span>{rule.label}</span>
          </div>
        )
      })}
    </div>
  )
}
