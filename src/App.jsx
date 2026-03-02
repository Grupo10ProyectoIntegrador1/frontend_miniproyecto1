import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './styles/App.css'
import MainLayout from './components/layout/MainLayout'
import CreatePage from './pages/CreatePage'
import ActivityPage from './pages/ActivityPage'
import ProgressPage from './pages/ProgressPage'
import ActivityDetailPage from './pages/ActivityDetailPage'

import LoginPage from './pages/LoginPage'

import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/routing/ProtectedRoute'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          {/* Todas  estas rutas comparten el Sidebar y están protegidas */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            {/*Redirige la raiz a /hoy */}
            <Route path="/" element={<Navigate to="/hoy" replace />} />
            <Route path="/hoy" element={<div>Hoy - Próximamente</div>} />
            <Route path="/crear" element={<CreatePage />} />
            <Route path="/actividad/:id" element={< ActivityDetailPage />} />
            <Route path="/actividades" element={<ActivityPage />} />
            <Route path="/progreso" element={<ProgressPage />} />
          </Route>
          {/*Por si ingresan una ruta mal puesta*/}
          <Route path="*" element={<Navigate to="/hoy" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
