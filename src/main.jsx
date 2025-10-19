import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import apiConfig from './config/api.config.js'

// Initialize MSW
async function enableMocking() {
  // Enable MSW only if USE_MOCK_API is true and not in production
  if (apiConfig.useMockApi && import.meta.env.MODE !== 'production') {
    const { worker } = await import('./mocks/browser')

    return worker.start({
      onUnhandledRequest: 'bypass',
    })
  }
  return Promise.resolve()
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
