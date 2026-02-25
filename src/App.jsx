import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './styles/App.css'
import MainLayout from './components/layout/MainLayout'
import CreatePage from './pages/CreatePage'


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<div>Login - Próximamente</div>} />
        {/*Como todas estan rutas comparten el Sidebar las agrupamos aqui*/}
        <Route element={<MainLayout />}>
          {/*Redirige la raiz a /hoy */}
          <Route path="/" element={<Navigate to="/hoy" replace/>}/>
          <Route path="/hoy" element={<div>Hoy - Próximamente</div>} />
          <Route path="/crear" element={<CreatePage />} />
          <Route path="/actividad/:id" element={<div>Detalle - Próximamente</div>} />
          <Route path="/progreso" element={<div>Progreso - Próximamente</div>} />
        </Route>
        {/*Por si ingresan una ruta mal puesta*/}
        <Route path="*" element={<Navigate to="/hoy" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
