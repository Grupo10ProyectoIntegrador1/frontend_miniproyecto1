import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

function MainLayout() {
  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />
      <main className="ml-64 flex-1 p-8">
        <Outlet />
      </main>
    </div>
  )
}

export default MainLayout