import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Login from './pages/Login'
import DevLogin from './pages/DevLogin'
import RegisterSociety from './pages/RegisterSociety'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import Societies from './pages/Societies'
import SupportReview from './pages/SupportReview'
import SupportAnalytics from './pages/SupportAnalytics'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  // Authentication state is handled by ProtectedRoute components

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dev-login" element={<DevLogin />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="societies" element={<Societies />} />
        <Route path="support">
          <Route path="review" element={<SupportReview />} />
          <Route path="analytics" element={<SupportAnalytics />} />
        </Route>
      </Route>
      <Route
        path="/register-society"
        element={
          <ProtectedRoute>
            <RegisterSociety />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App
