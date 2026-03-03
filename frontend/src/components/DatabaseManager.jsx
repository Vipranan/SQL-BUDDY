import { useState } from 'react'
import { motion } from 'framer-motion'
import { HiPlusCircle, HiMagnifyingGlass } from 'react-icons/hi2'
import toast from 'react-hot-toast'

export default function DatabaseManager({ onDatabaseAdded }) {
    const [name, setName] = useState('')
    const [type, setType] = useState('postgres')
    const [url, setUrl] = useState('')
    const [adding, setAdding] = useState(false)

    const [discovering, setDiscovering] = useState(false)
    const [sqliteDbs, setSqliteDbs] = useState([])

    const handleAdd = async () => {
        if (!name.trim() || !url.trim()) {
            toast.error('Please fill in all fields')
            return
        }
        setAdding(true)
        try {
            const res = await fetch('/databases/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, type, url }),
            })
            if (res.ok) {
                toast.success(`Database "${name}" added!`)
                setName('')
                setUrl('')
                onDatabaseAdded()
            } else {
                const err = await res.json()
                toast.error(err.detail || 'Failed to add database')
            }
        } catch (err) {
            toast.error(err.message)
        } finally {
            setAdding(false)
        }
    }

    const handleDiscover = async () => {
        setDiscovering(true)
        setSqliteDbs([])
        try {
            const res = await fetch('/databases/local/sqlite')
            const data = await res.json()
            setSqliteDbs(data.sqlite_databases || [])
            if (data.sqlite_databases.length === 0) {
                toast('No SQLite databases found in the current folder', { icon: '🔍' })
            }
        } catch (err) {
            toast.error(err.message)
        } finally {
            setDiscovering(false)
        }
    }

    const addDiscovered = async (dbName, dbUrl) => {
        try {
            await fetch('/databases/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: dbName, type: 'sqlite', url: dbUrl }),
            })
            toast.success(`Database "${dbName}" added!`)
            onDatabaseAdded()
        } catch (err) {
            toast.error(err.message)
        }
    }

    return (
        <div className="two-col-grid">
            {/* Add Database */}
            <motion.div
                className="glass-card motion-card"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.45 }}
            >
                {/* macOS Window Chrome */}
                <div className="window-chrome">
                    <div className="traffic-light red" />
                    <div className="traffic-light yellow" />
                    <div className="traffic-light green" />
                    <span className="window-title">Add Database</span>
                </div>

                <div className="card-header">
                    <div className="card-icon green">
                        <HiPlusCircle />
                    </div>
                    <div>
                        <div className="card-title">Add Database</div>
                        <div className="card-subtitle">Connect a new database</div>
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Database Name</label>
                    <input
                        id="db-name"
                        className="form-input"
                        placeholder="my_database"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Database Type</label>
                    <select
                        id="db-type"
                        className="form-select"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                    >
                        <option value="postgres">PostgreSQL</option>
                        <option value="sqlite">SQLite</option>
                    </select>
                </div>

                <div className="form-group">
                    <label className="form-label">Connection URL</label>
                    <input
                        id="db-url"
                        className="form-input"
                        placeholder="postgresql://user:pass@host:5432/db"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                    />
                </div>

                <button
                    className="btn btn-success"
                    onClick={handleAdd}
                    disabled={adding}
                    id="add-db-btn"
                >
                    {adding ? (
                        <>
                            <span className="spinner" /> Adding...
                        </>
                    ) : (
                        <>
                            <HiPlusCircle /> Add Database
                        </>
                    )}
                </button>
            </motion.div>

            {/* Discover SQLite */}
            <motion.div
                className="glass-card motion-card"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.45 }}
            >
                {/* macOS Window Chrome */}
                <div className="window-chrome">
                    <div className="traffic-light red" />
                    <div className="traffic-light yellow" />
                    <div className="traffic-light green" />
                    <span className="window-title">Discover Databases</span>
                </div>

                <div className="card-header">
                    <div className="card-icon cyan">
                        <HiMagnifyingGlass />
                    </div>
                    <div>
                        <div className="card-title">Discover SQLite</div>
                        <div className="card-subtitle">
                            Scan current folder for local databases
                        </div>
                    </div>
                </div>

                <button
                    className="btn btn-ghost"
                    onClick={handleDiscover}
                    disabled={discovering}
                    id="discover-btn"
                >
                    {discovering ? (
                        <>
                            <span className="spinner" /> Scanning...
                        </>
                    ) : (
                        <>
                            <HiMagnifyingGlass /> Scan Folder
                        </>
                    )}
                </button>

                {sqliteDbs.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.25 }}
                    >
                        {sqliteDbs.map((db, i) => (
                            <motion.div
                                className="db-item"
                                key={db.name}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.06 }}
                            >
                                <code>{db.name}</code>
                                <button
                                    className="btn btn-success"
                                    onClick={() => addDiscovered(db.name, db.url)}
                                >
                                    Add
                                </button>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {!discovering && sqliteDbs.length === 0 && (
                    <div className="empty-state" style={{ padding: '1.5rem 1rem' }}>
                        <span className="empty-icon">🔍</span>
                        <p>Click scan to discover local SQLite databases</p>
                    </div>
                )}
            </motion.div>
        </div>
    )
}
