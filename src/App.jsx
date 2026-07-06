import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import BottomNav from './components/BottomNav'
import { SocketProvider } from './context/SocketContext'
import { UnreadProvider } from './context/UnreadContext'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Onboarding from './pages/Onboarding'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import MapPage from './pages/MapPage'
import ChatPage from './pages/ChatPage'
import SettingsPage from './pages/SettingsPage'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={styles.loading}>Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

function PublicRoute({ children, landing }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={styles.loading}>Loading...</div>
  if (user && !landing) return <Navigate to="/map" replace />
  if (user && landing) return children
  return children
}

function AppLayout({ children }) {
  const location = useLocation()
  const hideNav = location.pathname === '/' || location.pathname === '/onboarding'
  return (
    <div className="page-layout">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {children}
      </div>
      {!hideNav && <BottomNav />}
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <UnreadProvider>
        <Routes>
          <Route path="/" element={<PublicRoute landing><Landing /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
          <Route path="/reset-password/:token" element={<PublicRoute><ResetPassword /></PublicRoute>} />
          <Route path="/map" element={<ProtectedRoute><AppLayout><MapPage /></AppLayout></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><AppLayout><ChatPage /></AppLayout></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><AppLayout><SettingsPage /></AppLayout></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
          </UnreadProvider>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

const styles = {
  loading: {
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#e8e8e8',
    color: '#888',
    fontSize: 16,
  },
  placeholder: {
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#e8e8e8',
    color: '#888',
    fontSize: 18,
    paddingBottom: 60,
  },
}
