import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { UserProvider, useUser } from './contexts/UserContext'
import LoginPage from './features/auth/components/pages/LoginPage'
import RegisterPage from './features/auth/components/RegisterForm'
import DashboardPage from './features/Dashboard/pages/DashboardPage'
import NavBar from './components/NavBar';


function AppRoutes() {
  const { user } = useUser()

  return (
    <Routes>
      {!user ? (
        <>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </>
      ) : (
        <>
          {/* פה נוסיף עמודים בעתיד */}
          <>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </>        </>
      )}
    </Routes>
  )
}

function App() {
  return (
    <UserProvider>
      <Router>
        <NavBar />
        <AppRoutes />
      </Router>
    </UserProvider>
  )
}

export default App
