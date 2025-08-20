import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './state/auth.jsx'
 import { SocketProvider } from './state/socket.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
         <SocketProvider> 
          <App />
          <Toaster position="top-center" />
         </SocketProvider> 
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
