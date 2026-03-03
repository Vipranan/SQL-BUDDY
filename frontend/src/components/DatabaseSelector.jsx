import { motion } from 'framer-motion'
import { HiCircleStack } from 'react-icons/hi2'

export default function DatabaseSelector({ databases, activeDb, onSelect }) {
    return (
        <motion.div
            className="glass-card motion-card"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
        >
            {/* macOS Window Chrome */}
            <div className="window-chrome">
                <div className="traffic-light red" />
                <div className="traffic-light yellow" />
                <div className="traffic-light green" />
                <span className="window-title">Database Connection</span>
            </div>

            <div className="card-header">
                <div className="card-icon purple">
                    <HiCircleStack />
                </div>
                <div>
                    <div className="card-title">Active Database</div>
                    <div className="card-subtitle">Select the database to query</div>
                </div>
            </div>

            <div className="db-selector">
                <select
                    id="db-select"
                    value={activeDb || ''}
                    onChange={(e) => onSelect(e.target.value)}
                >
                    {Object.keys(databases).map((name) => (
                        <option key={name} value={name}>
                            {name}
                        </option>
                    ))}
                </select>

                {activeDb && (
                    <motion.div
                        className="db-status"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        key={activeDb}
                    >
                        <span className="status-dot" />
                        {activeDb}
                    </motion.div>
                )}
            </div>
        </motion.div>
    )
}
