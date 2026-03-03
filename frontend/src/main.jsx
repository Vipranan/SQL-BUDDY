import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { Toaster } from 'react-hot-toast'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <Toaster
            position="top-right"
            toastOptions={{
                style: {
                    background: 'var(--bg-popover)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--glass-border)',
                    backdropFilter: 'blur(24px) saturate(150%)',
                    WebkitBackdropFilter: 'blur(24px) saturate(150%)',
                    borderRadius: '12px',
                    fontSize: '0.85rem',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", system-ui, sans-serif',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
                },
                success: {
                    iconTheme: { primary: '#30D158', secondary: '#fff' },
                },
                error: {
                    iconTheme: { primary: '#FF453A', secondary: '#fff' },
                },
            }}
        />
        <App />
    </React.StrictMode>,
)
