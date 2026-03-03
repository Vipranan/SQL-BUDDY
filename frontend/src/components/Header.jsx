import { motion } from 'framer-motion'
import { HiMoon, HiSun } from 'react-icons/hi2'

export default function Header({ theme, setTheme }) {
    return (
        <motion.header
            className="header"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        >
            <div className="header-controls">
                <div className="theme-toggle">
                    <button
                        className={theme === 'dark' ? 'active' : ''}
                        onClick={() => setTheme('dark')}
                        title="Dark Mode"
                        aria-label="Switch to dark mode"
                    >
                        <HiMoon />
                    </button>
                    <button
                        className={theme === 'light' ? 'active' : ''}
                        onClick={() => setTheme('light')}
                        title="Light Mode"
                        aria-label="Switch to light mode"
                    >
                        <HiSun />
                    </button>
                </div>
            </div>

            <motion.div
                className="header-badge"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
            >
                <span className="dot" />
                AI-Powered Natural Language to SQL
            </motion.div>

            <h1>
                <span className="gradient-text">SQL Buddy</span>
            </h1>

            <motion.p
                className="header-subtitle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
            >
                Ask questions in any language — get SQL results instantly
            </motion.p>
        </motion.header>
    )
}
