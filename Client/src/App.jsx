import './App.css'
import React from 'react'
import { Routes, Route } from 'react-router-dom'
import LobbyScreen from './Screens/Lobby.jsx'
import Home from './Pages/Home.jsx'



function App() {

  return (
    <div className='App'>
      <Routes>
        <Route path='/' element={<Home />} />
      </Routes>
    </div>
  )
}

export default App
