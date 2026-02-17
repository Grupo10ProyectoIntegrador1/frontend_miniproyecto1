import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './styles/App.css'
import api from './services/api'

function App() {
  const [count, setCount] = useState(0)
  const [backendMessage, setBackendMessage] = useState('')
  const [dbStatus, setDbStatus] = useState(null)

  useEffect(() => {
    api.get('/api/health/')
      .then(response => {
        setBackendMessage(response.data.message)
      })
      .catch(error => {
        console.error('Error connecting to backend:', error)
        setBackendMessage('Error connecting to backend')
      })
  }, [])

  const testDbConnection = () => {
    setDbStatus('Testing...')
    api.get('/api/test-db/')
      .then(response => {
        setDbStatus(response.data.message)
      })
      .catch(error => {
        console.error('Error connecting to DB:', error)
        setDbStatus('Error connecting to DB: ' + error.message)
      })
  }

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <p>Backend Status: {backendMessage}</p>

        <div style={{ margin: '20px 0', padding: '10px', border: '1px solid #ccc', borderRadius: '8px' }}>
          <button onClick={testDbConnection}>
            Test Supabase DB Connection
          </button>
          {dbStatus && <p><strong>DB Status:</strong> {dbStatus}</p>}
        </div>

        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
