import { Box } from "@chakra-ui/react"
import { Routes, Route, Navigate } from "react-router-dom"
import NavBar from "./components/Navbar"
import HomePage from "./pages/HomePage"
import CameraAdd from "./pages/CameraAdd"
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
    <Box minH={"100vh"} bgColor={"#1a202c"}>
      <NavBar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/camera" element={<CameraAdd />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Box>
  )
}

export default App