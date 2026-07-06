import { IconCircle, IconCircleCheckFilled } from '@tabler/icons-react'

const rules = [
  { label: 'At least 8 characters', test: v => v.length >= 8 },
  { label: 'Uppercase letter', test: v => /[A-Z]/.test(v) },
  { label: 'A number', test: v => /[0-9]/.test(v) },
  { label: 'A symbol', test: v => /[^a-zA-Z0-9]/.test(v) },
]

export default function PasswordChecklist({ password }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 'var(--sp-1)',
      marginTop: 'var(--sp-2)', marginBottom: 'var(--sp-3)',
    }}>
      {rules.map(rule => {
        const pass = rule.test(password)
        return (
          <div key={rule.label} style={{
            display: 'flex', alignItems: 'center', gap: 'var(--sp-2)',
            fontSize: 'var(--fs-xs)', color: pass ? 'var(--semantic-people)' : 'var(--text-muted)',
          }}>
            <span className={pass && password.length > 0 ? 'animate-scale-pop' : ''} style={{ display: 'flex' }}>
              {pass ? <IconCircleCheckFilled size={16} /> : <IconCircle size={16} />}
            </span>
            {rule.label}
          </div>
        )
      })}
    </div>
  )
}
