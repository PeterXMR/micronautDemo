import React from 'react'
import Converter from './components/Converter'
import './App.css'
import { runAllTests } from './lib/api.test'

// Expose test suite to window for manual testing in browser console
if (typeof window !== 'undefined') {
  (window as any).apiTests = { runAllTests }
}

function App() {
  return (
    <div className="App">
      <Converter />
    </div>
  )
}

export default App

