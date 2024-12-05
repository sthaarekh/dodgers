import './App.css'
import Navbar from './assets/components/Navbar'
import Navbarh from './assets/components/Navbarh'
import { Routes, Route, BrowserRouter, useLocation } from 'react-router-dom'
import Home from './assets/pages/Home'
import Login from './assets/pages/Login'
import Signup from './assets/pages/Signup'
import Call from './assets/pages/Call'
import Addcontacts from './assets/pages/Addcontacts'
import Landing from './assets/pages/Landing'
import LandingPage from './assets/pages/Landing'

// Wrapper component to handle conditional navbar rendering
function NavbarWrapper() {
  const location = useLocation();
  const noNavbarRoutes = ['/login', '/signup', '/'];

  return (
    <>
      {noNavbarRoutes.includes(location.pathname) ? <Navbar /> : <Navbarh />}
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/signup" element={<Signup/>} />
        <Route path="/call" element={<Call/>} />
        <Route path="/add" element={<Addcontacts/>} />
        <Route path="/" element={<Landing/>} />
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