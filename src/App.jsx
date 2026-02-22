import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './styles/App.css'
import api from './services/api'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/*Redirige la raiz a /hoy */}
        <Route path="/" element={<Navigate to="/hoy" replace/>}/>
        <Route path="/login" element={<div>Login - Próximamente</div>} />
        <Route path="/hoy" element={<div>Hoy - Próximamente</div>} />
        <Route path="/crear" element={<div>Crear - Próximamente</div>} />
        <Route path="/actividad/:id" element={<div>Detalle - Próximamente</div>} />
        <Route path="/progreso" element={<div>Progreso - Próximamente</div>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
