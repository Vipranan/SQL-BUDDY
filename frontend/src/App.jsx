import { useState, useEffect, useCallback, Suspense } from 'react'
import toast from 'react-hot-toast'
import Header from './components/Header'
import DatabaseSelector from './components/DatabaseSelector'
import QueryInput from './components/QueryInput'
import ResultsPanel from './components/ResultsPanel'
import DatabaseManager from './components/DatabaseManager'

export default function App() {
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark')
    const [databases, setDatabases] = useState({})
    const [activeDb, setActiveDb] = useState(null)
    const [queryResult, setQueryResult] = useState(null)
    const [currentQuery, setCurrentQuery] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    // Theme persistence
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme)
        localStorage.setItem('theme', theme)
    }, [theme])

    // Load databases
    const loadDatabases = useCallback(async () => {
        try {
            const res = await fetch('/databases')
            const data = await res.json()
            setDatabases(data.databases || {})
            setActiveDb(data.active || null)
        } catch (err) {
            console.error('Failed to load databases:', err)
        }
    }, [])

    useEffect(() => {
        loadDatabases()
    }, [loadDatabases])

    // Select database
    const handleSelectDb = async (name) => {
        try {
            await fetch('/databases/select', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
            })
            setActiveDb(name)
            toast.success(`Switched to ${name}`)
        } catch (err) {
            toast.error('Failed to switch database')
        }
    }

    // Submit query
    const handleQuery = async (query) => {
        setIsLoading(true)
        setCurrentQuery(query)
        setQueryResult(null)

        try {
            const res = await fetch('/query', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query }),
            })

            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.detail || 'Query failed')
            }

            const data = await res.json()
            setQueryResult(data)
            toast.success(`Found ${data.rows?.length || 0} results`)
        } catch (err) {
            toast.error(err.message)
            setQueryResult({ error: err.message })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="app-container">
            <Header theme={theme} setTheme={setTheme} />

            {/* Scroll target for board click */}
            <div id="db-section">
                <DatabaseSelector
                    databases={databases}
                    activeDb={activeDb}
                    onSelect={handleSelectDb}
                />
            </div>

            <QueryInput onSubmit={handleQuery} isLoading={isLoading} />

            <ResultsPanel data={queryResult} queryText={currentQuery} />

            <DatabaseManager onDatabaseAdded={loadDatabases} />
        </div>
    )
}
