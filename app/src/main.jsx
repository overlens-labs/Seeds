import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@overlens/legacy-foundations/fonts.css'
import '@overlens/legacy-foundations/theme.css'
import '@overlens/legacy-components/styles.css'
import '@overlens/legacy-icons/styles.css'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
