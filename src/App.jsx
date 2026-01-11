import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Login from './pages/Login'
import Home from './pages/Home'
import Oratori from './pages/Oratori'
import Programmi from './pages/Programmi'
import Profilo from './pages/Profilo'
import Admin from './pages/Admin'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/oratori"
            element={
              <ProtectedRoute>
                <Oratori />
              </ProtectedRoute>
            }
          />
          <Route
            path="/programmi"
            element={
              <ProtectedRoute>
                <Programmi />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profilo"
            element={
              <ProtectedRoute>
                <Profilo />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
