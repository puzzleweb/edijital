import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Clean up any old cached packages from browser storage
try {
  ['edijital_packages_v1', 'edijital_packages_v2', 'edijital_packages_v3'].forEach(k => {
    const raw = localStorage.getItem(k);
    if (raw && raw.includes('2 Yıl')) {
      localStorage.removeItem(k);
    }
  });
} catch (e) {
  // ignore
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
