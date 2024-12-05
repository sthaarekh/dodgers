import './App.css'
import Navbar from './assets/components/Navbar'
import Navbarh from './assets/components/Navbarh'
import { Routes, Route, BrowserRouter, useLocation, Navigate } from 'react-router-dom'
import Home from './assets/pages/Home'
import Login from './assets/pages/Login'
import Signup from './assets/pages/Signup'
import Call from './assets/pages/Call'
import Addcontacts from './assets/pages/Addcontacts'
import Landing from './assets/pages/Landing'
import PropTypes from "prop-types";

// Wrapper component to handle conditional navbar rendering
function NavbarWrapper() {
  const location = useLocation();
  const noNavbarRoutes = ['/login', '/signup', '/'];


// PrivateRoute Component to protect routes
const PrivateRoute = ({ children }) => {
  const isAuthenticated = () => {
    const token = localStorage.getItem('token'); // Check for token or any other auth logic
    return !!token; // Return true if authenticated
  };

  return isAuthenticated() ? children : <Navigate to="/login" />;
};

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired, // Ensures 'children' is passed and is valid JSX/element
};


  return (
    <>
    {noNavbarRoutes.includes(location.pathname) ? <Navbar /> : <Navbarh />}
    <Routes>
      <Route path="/" element={<Landing />} />
      {/* Protect home route */}
      <Route
        path="/home/:userId"
        element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        }
      />

      {/* Protect call route */}
      <Route
        path="/call"
        element={
          <PrivateRoute>
            <Call />
          </PrivateRoute>
        }
      />
      {/* Protect add route */}
      <Route
        path="/add"
        element={
          <PrivateRoute>
            <Addcontacts />
          </PrivateRoute>
        }
      />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
    </Routes>
  </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <NavbarWrapper />
    </BrowserRouter>
  )
}

export default App