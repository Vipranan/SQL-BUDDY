import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiTableCells, HiCodeBracket, HiDocumentArrowDown, HiGlobeAlt, HiBolt, HiChartBar } from 'react-icons/hi2'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

export default function ResultsPanel({ data, queryText }) {
    const [view, setView] = useState('table')

    const hasData = data && data.rows && data.rows.length > 0

    const exportPDF = () => {
        if (!hasData) return

        const columns = data.columns || Object.keys(data.rows[0])
        const rows = data.rows.map((row) =>
            Array.isArray(row)
                ? row.map((c) => (c !== null ? String(c) : 'null'))
                : Object.values(row).map((c) => (c !== null ? String(c) : 'null'))
        )

        const orientation = columns.length > 5 ? 'landscape' : 'portrait'
        const doc = new jsPDF(orientation)
        let y = 15

        doc.setFontSize(18)
        doc.setTextColor(0, 122, 255)
        doc.text('SQL Buddy — Query Results', 14, y)
        y += 10

        doc.setFontSize(10)
        doc.setTextColor(100, 100, 100)
        doc.text(`Database: ${data.active_database || 'N/A'}`, 14, y)
        y += 7

        const maxW = orientation === 'landscape' ? 270 : 180
        if (queryText) {
            doc.setFontSize(9)
            const lines = doc.splitTextToSize(`Query: ${queryText}`, maxW)
            doc.text(lines, 14, y)
            y += lines.length * 5
        }

        if (data.english_query) {
            const elines = doc.splitTextToSize(`English: ${data.english_query}`, maxW)
            doc.text(elines, 14, y)
            y += elines.length * 5
        }

        if (data.sql) {
            doc.setTextColor(0, 122, 255)
            const slines = doc.splitTextToSize(`SQL: ${data.sql}`, maxW)
            doc.text(slines, 14, y)
            y += slines.length * 5 + 5
        }

        doc.autoTable({
            head: [columns],
            body: rows,
            startY: y,
            theme: 'grid',
            headStyles: {
                fillColor: [0, 122, 255],
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                fontSize: 9,
            },
            bodyStyles: { fontSize: 8, textColor: [50, 50, 50] },
            alternateRowStyles: { fillColor: [245, 247, 250] },
            styles: { cellPadding: 3, overflow: 'linebreak' },
            margin: { left: 14, right: 14 },
        })

        const pages = doc.internal.getNumberOfPages()
        for (let i = 1; i <= pages; i++) {
            doc.setPage(i)
            doc.setFontSize(8)
            doc.setTextColor(150, 150, 150)
            doc.text(
                `Page ${i} of ${pages} | Generated on ${new Date().toLocaleString()}`,
                doc.internal.pageSize.getWidth() / 2,
                doc.internal.pageSize.getHeight() - 10,
                { align: 'center' }
            )
        }

        doc.save(`sql_buddy_results_${Date.now()}.pdf`)
    }

    const exportCSV = () => {
        if (!hasData) return

        const columns = data.columns || Object.keys(data.rows[0])
        const escapeCSV = (v) => {
            if (v === null || v === undefined) return ''
            const s = String(v)
            if (s.includes(',') || s.includes('"') || s.includes('\n'))
                return '"' + s.replace(/"/g, '""') + '"'
            return s
        }

        let csv = columns.map(escapeCSV).join(',') + '\n'
        data.rows.forEach((row) => {
            const arr = Array.isArray(row) ? row : Object.values(row)
            csv += arr.map(escapeCSV).join(',') + '\n'
        })

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `sql_buddy_results_${Date.now()}.csv`
        link.click()
        URL.revokeObjectURL(link.href)
    }

    return (
        <>
            {/* Interpretation + SQL cards */}
            <div className="results-grid">
                <motion.div
                    className="glass-card motion-card"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.45 }}
                >
                    <div className="card-header">
                        <div className="card-icon cyan">
                            <HiGlobeAlt />
                        </div>
                        <div>
                            <div className="card-title">English Interpretation</div>
                            <div className="card-subtitle">Translated meaning of your query</div>
                        </div>
                    </div>
                    <div className="result-box">
                        <pre>
                            {data?.english_query || (
                                <span className="result-placeholder">
                                    Your question will appear here...
                                </span>
                            )}
                        </pre>
                    </div>
                </motion.div>

                <motion.div
                    className="glass-card motion-card"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25, duration: 0.45 }}
                >
                    <div className="card-header">
                        <div className="card-icon orange">
                            <HiBolt />
                        </div>
                        <div>
                            <div className="card-title">Generated SQL</div>
                            <div className="card-subtitle">AI-generated SQL query</div>
                        </div>
                    </div>
                    <div className="result-box accent">
                        <pre>
                            {data?.sql || (
                                <span className="result-placeholder">
                                    SQL query will appear here...
                                </span>
                            )}
                        </pre>
                    </div>
                </motion.div>
            </div>

            {/* Results Table */}
            <motion.div
                className="glass-card motion-card"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.45 }}
            >
                {/* macOS Window Chrome */}
                <div className="window-chrome">
                    <div className="traffic-light red" />
                    <div className="traffic-light yellow" />
                    <div className="traffic-light green" />
                    <span className="window-title">Query Results</span>
                </div>

                <div className="card-header">
                    <div className="card-icon green">
                        <HiChartBar />
                    </div>
                    <div>
                        <div className="card-title">Query Results</div>
                        <div className="card-subtitle">
                            {hasData
                                ? `${data.rows.length} row${data.rows.length !== 1 ? 's' : ''} returned`
                                : 'Execute a query to see results'}
                        </div>
                    </div>
                </div>

                <div className="view-toggle">
                    <button
                        className={`toggle-btn ${view === 'table' ? 'active' : ''}`}
                        onClick={() => setView('table')}
                        id="table-view-btn"
                    >
                        <HiTableCells /> Table
                    </button>
                    <button
                        className={`toggle-btn ${view === 'json' ? 'active' : ''}`}
                        onClick={() => setView('json')}
                        id="json-view-btn"
                    >
                        <HiCodeBracket /> JSON
                    </button>
                    <button
                        className="export-btn"
                        onClick={exportPDF}
                        disabled={!hasData}
                        id="export-pdf-btn"
                    >
                        <HiDocumentArrowDown /> PDF
                    </button>
                    <button
                        className="export-btn"
                        onClick={exportCSV}
                        disabled={!hasData}
                        id="export-csv-btn"
                    >
                        <HiDocumentArrowDown /> CSV
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    {view === 'table' ? (
                        <motion.div
                            key="table"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                        >
                            {hasData ? (
                                <div className="table-container">
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                {(data.columns || Object.keys(data.rows[0])).map(
                                                    (col, i) => (
                                                        <th key={i}>{col}</th>
                                                    )
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.rows.map((row, ri) => (
                                                <motion.tr
                                                    key={ri}
                                                    initial={{ opacity: 0, x: -8 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: ri * 0.02 }}
                                                >
                                                    {(Array.isArray(row)
                                                        ? row
                                                        : Object.values(row)
                                                    ).map((cell, ci) => (
                                                        <td key={ci}>
                                                            {cell !== null ? (
                                                                String(cell)
                                                            ) : (
                                                                <span className="null-value">null</span>
                                                            )}
                                                        </td>
                                                    ))}
                                                </motion.tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <span className="empty-icon">📊</span>
                                    <p>Results will appear here after you ask a question</p>
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="json"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="json-view"
                        >
                            <pre>
                                {hasData
                                    ? JSON.stringify(data.rows, null, 2)
                                    : 'Results will appear here...'}
                            </pre>
                        </motion.div>
                    )}
                </AnimatePresence>

                {hasData && (
                    <div className="row-count">
                        {data.rows.length} row{data.rows.length !== 1 ? 's' : ''} •{' '}
                        {data.active_database || 'Unknown DB'}
                    </div>
                )}
            </motion.div>
        </>
    )
}
