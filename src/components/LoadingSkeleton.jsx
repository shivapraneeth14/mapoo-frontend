export default function LoadingSkeleton({ width = '100%', height = 20, style }) {
  return (
    <div style={{
      width,
      height,
      borderRadius: 8,
      background: 'linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
      ...style,
    }} />
  )
}
