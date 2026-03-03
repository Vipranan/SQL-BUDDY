import { useState } from 'react'
import { motion } from 'framer-motion'
import { HiSparkles, HiLanguage } from 'react-icons/hi2'

export default function QueryInput({ onSubmit, isLoading }) {
    const [query, setQuery] = useState('')

    const handleSubmit = () => {
        if (!query.trim()) return
        onSubmit(query)
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            handleSubmit()
        }
    }

    return (
        <motion.div
            className="query-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
        >
            <div className="query-label">
                <HiLanguage />
                Ask in Tamil, Hindi, English, or any language...
            </div>

            <textarea
                id="query-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g., Show me all customers from India, இந்தியாவிலிருந்து அனைத்து வாடிக்கையாளர்களையும் காட்டு"
                disabled={isLoading}
            />

            <button
                className="query-submit-btn"
                onClick={handleSubmit}
                disabled={isLoading || !query.trim()}
                id="query-submit"
            >
                {isLoading ? (
                    <>
                        <span className="spinner" />
                        Processing...
                    </>
                ) : (
                    <>
                        <HiSparkles />
                        Ask SQL Buddy
                    </>
                )}
            </button>

            <div style={{
                textAlign: 'right',
                marginTop: '0.5rem',
                fontSize: '0.75rem',
                color: 'rgba(255,255,255,0.4)'
            }}>
                Press ⌘ + Enter to submit
            </div>
        </motion.div>
    )
}
