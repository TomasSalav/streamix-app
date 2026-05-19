import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Index from './pages/Index/Index';
import Watch from './pages/Watch/Watch';

function App() {
  // Aplicación principal donde corre el enrutador de react-router-dom 

  return (
    // Enrutador
    <Router>
      <Routes>
        <Route path='/login' element={<Login />}/>
        <Route path='/register' element={<Register />}/>
        <Route path='/' element={<Index />}/>
        <Route path='/watch/:id' element={<Watch />}/>
      </Routes>
    </Router>
  )
}

export default App;