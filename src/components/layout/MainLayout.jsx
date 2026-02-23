import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

function MainLayout() {
    return (
        <div className="flex bg-zinc-950 min-h-screen">
            <Sidebar />
            <main className="ml-64 flex-1 p-8 text-white">
                <Outlet />
            </main>
        </div>
    )
}

export default MainLayout