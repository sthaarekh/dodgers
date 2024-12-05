import './App.css'
import Navbar from './assets/components/Navbar'
import { Routes, Route, BrowserRouter } from 'react-router-dom'
import Home from './assets/pages/Home'
import Login from './assets/pages/Login'
import Signup from './assets/pages/Signup'
import Call from './assets/pages/Call'
import Addcontacts from './assets/pages/Addcontacts'

function App() {

  return (
    <>
  <Navbar/>

  {/* Router dom */}
  <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/signup" element={<Signup/>} />
        <Route path="/call" element={<Call/>} />
        <Route path="/call" element={<Addcontacts/>} />
      </Routes>
      </BrowserRouter>
    </>
  )
}

export default App