import React, { useState } from 'react'
import Converter from './components/Converter'
import History from './components/History'
import './App.css'
import { runAllTests } from './lib/api.test'

// Expose test suite to window for manual testing in browser console
if (typeof window !== 'undefined') {
  (window as any).apiTests = { runAllTests }
}

type Page = 'converter' | 'history'

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('converter')

  return (
    <div className="App">
      <nav className="app-nav">
        <button
          className={`nav-btn ${currentPage === 'converter' ? 'active' : ''}`}
          onClick={() => setCurrentPage('converter')}
        >
          💱 Converter
        </button>
        <button
          className={`nav-btn ${currentPage === 'history' ? 'active' : ''}`}
          onClick={() => setCurrentPage('history')}
        >
          📊 Rate History
        </button>
      </nav>

      {currentPage === 'converter' && <Converter />}
      {currentPage === 'history' && <History />}
    </div>
  )
}

export default App

