import React, { useState, useEffect } from 'react'
import { Brain, Save, Trash2, Clock } from 'lucide-react'

const MindDumpPad = () => {
  const [content, setContent] = useState('')
  const [lastSaved, setLastSaved] = useState(null)
  const [autoSaveTimer, setAutoSaveTimer] = useState(null)

  useEffect(() => {
    // Load from localStorage on mount
    const saved = localStorage.getItem('mindDump')
    const timestamp = localStorage.getItem('mindDumpTimestamp')
    
    if (saved && timestamp) {
      const savedTime = new Date(timestamp)
      const now = new Date()
      const hoursDiff = (now - savedTime) / (1000 * 60 * 60)
      
      // Clear if older than 24 hours
      if (hoursDiff > 24) {
        localStorage.removeItem('mindDump')
        localStorage.removeItem('mindDumpTimestamp')
      } else {
        setContent(saved)
        setLastSaved(savedTime)
      }
    }
  }, [])

  useEffect(() => {
    // Auto-save after 2 seconds of no typing
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer)
    }

    if (content.trim()) {
      const timer = setTimeout(() => {
        saveToDump()
      }, 2000)
      setAutoSaveTimer(timer)
    }

    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer)
      }
    }
  }, [content])

  const saveToDump = () => {
    if (content.trim()) {
      const now = new Date()
      localStorage.setItem('mindDump', content)
      localStorage.setItem('mindDumpTimestamp', now.toISOString())
      setLastSaved(now)
    }
  }

  const clearDump = () => {
    if (window.confirm('Are you sure you want to clear your mind dump?')) {
      setContent('')
      setLastSaved(null)
      localStorage.removeItem('mindDump')
      localStorage.removeItem('mindDumpTimestamp')
    }
  }

  const formatLastSaved = () => {
    if (!lastSaved) return ''
    const now = new Date()
    const diff = now - lastSaved
    const minutes = Math.floor(diff / (1000 * 60))
    
    if (minutes < 1) return 'Saved just now'
    if (minutes < 60) return `Saved ${minutes}m ago`
    
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `Saved ${hours}h ago`
    
    return 'Saved yesterday'
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Brain className="w-6 h-6 text-indigo-600" />
          <div>
            <h3 className="text-lg font-semibold">Mind Dump Pad</h3>
            <p className="text-sm text-gray-600">Clear your mental RAM before focusing</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {lastSaved && (
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>{formatLastSaved()}</span>
            </div>
          )}
          <button
            onClick={clearDump}
            className="text-gray-400 hover:text-red-600 transition-colors"
            title="Clear mind dump"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Dump all your thoughts here... What's on your mind? Worries? Ideas? Random thoughts?

This space clears after 24 hours unless you save it as a proper note."
        className="w-full h-40 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        style={{ fontFamily: 'monospace' }}
      />

      <div className="mt-3 flex justify-between items-center">
        <div className="text-xs text-gray-500">
          {content.length} characters • Auto-saves every 2 seconds • Clears after 24h
        </div>
        <button
          onClick={saveToDump}
          className="flex items-center space-x-1 text-sm text-indigo-600 hover:text-indigo-700"
        >
          <Save className="w-4 h-4" />
          <span>Save Now</span>
        </button>
      </div>
    </div>
  )
}

export default MindDumpPad