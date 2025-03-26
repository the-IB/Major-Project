import { Box } from "@chakra-ui/react"
import { Routes, Route, Navigate } from "react-router-dom"
import NavBar from "./components/Navbar"
import HomePage from "./pages/HomePage"
import CameraAdd from "./pages/CameraAdd"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import { AuthProvider, AuthContext } from "./context/AuthContext"
import { useContext } from "react"

// Private Route component for authenticated users
const PrivateRoute = ({ children, adminOnly = false }) => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Box minH={"100vh"} bgColor={"#1a202c"}>
        <NavBar />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes */}
          <Route path="/" element={
            <PrivateRoute>
              <HomePage />
            </PrivateRoute>
          } />

          <Route path="/camera" element={
            <PrivateRoute>
              <CameraAdd />
            </PrivateRoute>
          } />

          {/* Redirect unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Box>
    </AuthProvider>
  )
}

export default App