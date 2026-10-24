import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { LoaderProvider } from './context/LoaderProvider'
import { StoreProvider } from './context/StoreProvider'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <StoreProvider>
        <LoaderProvider>
          <App />
        </LoaderProvider>
      </StoreProvider>
    </BrowserRouter>
  </StrictMode>,
)
