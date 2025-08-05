import React, { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw, Settings } from 'lucide-react'
import axios from 'axios'
import DistractionJournal from './DistractionJournal'

const PomodoroTimer = ({ onSessionComplete, onTimerStateChange }) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false)
  const [sessionType, setSessionType] = useState('work') // 'work', 'shortBreak', 'longBreak'
  const [sessionCount, setSessionCount] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const [showDistractionJournal, setShowDistractionJournal] = useState(false)
  const [lastSessionId, setLastSessionId] = useState(null)
  const [settings, setSettings] = useState({
    workTime: 25,
    shortBreak: 5,
    longBreak: 15,
    sessionsUntilLongBreak: 4
  })
  
  const intervalRef = useRef(null)
  const audioRef = useRef(null)

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(time => time - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      handleSessionComplete()
    } else {
      clearInterval(intervalRef.current)
    }

    return () => clearInterval(intervalRef.current)
  }, [isActive, timeLeft])

  const handleSessionComplete = async () => {
    setIsActive(false)
    
    // Play notification sound
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.log('Audio play failed:', e))
    }

    // Show browser notification
    if (Notification.permission === 'granted') {
      new Notification('Pomodoro Session Complete!', {
        body: `${sessionType === 'work' ? 'Work' : 'Break'} session finished. Time for a ${getNextSessionType()}!`,
        icon: '/favicon.ico'
      })
    }

    // Record session to database
    const sessionData = {
      sessionType: sessionType,
      duration: sessionType === 'work' ? settings.workTime : 
                sessionType === 'shortBreak' ? settings.shortBreak : settings.longBreak
    }

    try {
      const response = await axios.post('/tasks/pomodoro-session', sessionData, { withCredentials: true })
      setLastSessionId(response.data.id)
      
      // Show distraction journal for work sessions
      if (sessionType === 'work') {
        setShowDistractionJournal(true)
      }
    } catch (error) {
      console.error('Failed to record pomodoro session:', error)
    }

    // Record session for local state
    const session = {
      type: sessionType,
      duration: sessionData.duration,
      completedAt: new Date().toISOString()
    }
    onSessionComplete(session)

    // Auto-start next session
    if (sessionType === 'work') {
      setSessionCount(prev => prev + 1)
      const nextType = (sessionCount + 1) % settings.sessionsUntilLongBreak === 0 ? 'longBreak' : 'shortBreak'
      setSessionType(nextType)
      setTimeLeft(nextType === 'longBreak' ? settings.longBreak * 60 : settings.shortBreak * 60)
    } else {
      setSessionType('work')
      setTimeLeft(settings.workTime * 60)
    }
  }

  const getNextSessionType = () => {
    if (sessionType === 'work') {
      return (sessionCount + 1) % settings.sessionsUntilLongBreak === 0 ? 'long break' : 'short break'
    }
    return 'work session'
  }

  const toggleTimer = () => {
    const newState = !isActive
    setIsActive(newState)
    if (onTimerStateChange) {
      onTimerStateChange(newState)
    }
  }

  const resetTimer = () => {
    setIsActive(false)
    if (onTimerStateChange) {
      onTimerStateChange(false)
    }
    setTimeLeft(sessionType === 'work' ? settings.workTime * 60 : 
                sessionType === 'shortBreak' ? settings.shortBreak * 60 : settings.longBreak * 60)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getSessionColor = () => {
    switch (sessionType) {
      case 'work': return 'text-red-600 bg-red-50 border-red-200'
      case 'shortBreak': return 'text-green-600 bg-green-50 border-green-200'
      case 'longBreak': return 'text-blue-600 bg-blue-50 border-blue-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }

  useEffect(() => {
    requestNotificationPermission()
  }, [])

  const handleDistractionSubmit = async (distractionData) => {
    if (lastSessionId) {
      try {
        await axios.post('/tasks/distraction', {
          sessionId: lastSessionId,
          type: distractionData.type,
          notes: distractionData.notes
        }, { withCredentials: true })
      } catch (error) {
        console.error('Failed to record distraction:', error)
      }
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Pomodoro Timer</h2>
        <p className="text-gray-600">Stay focused and productive with the Pomodoro Technique</p>
      </div>

      {/* Timer Display */}
      <div className="card text-center">
        <div className="mb-6">
          <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium border ${getSessionColor()}`}>
            {sessionType === 'work' ? 'Work Session' : 
             sessionType === 'shortBreak' ? 'Short Break' : 'Long Break'}
          </span>
        </div>

        <div className="text-8xl font-mono font-bold text-gray-900 mb-8">
          {formatTime(timeLeft)}
        </div>

        <div className="flex justify-center space-x-4 mb-6">
          <button
            onClick={toggleTimer}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              isActive 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            <span>{isActive ? 'Pause' : 'Start'}</span>
          </button>

          <button
            onClick={resetTimer}
            className="flex items-center space-x-2 btn-secondary"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Reset</span>
          </button>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center space-x-2 btn-secondary"
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </button>
        </div>

        <div className="text-sm text-gray-600">
          Session {sessionCount + 1} • Next: {getNextSessionType()}
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Timer Settings</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Work Time (minutes)
              </label>
              <input
                type="number"
                value={settings.workTime}
                onChange={(e) => setSettings({...settings, workTime: parseInt(e.target.value)})}
                className="input-field"
                min="1"
                max="60"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Short Break (minutes)
              </label>
              <input
                type="number"
                value={settings.shortBreak}
                onChange={(e) => setSettings({...settings, shortBreak: parseInt(e.target.value)})}
                className="input-field"
                min="1"
                max="30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Long Break (minutes)
              </label>
              <input
                type="number"
                value={settings.longBreak}
                onChange={(e) => setSettings({...settings, longBreak: parseInt(e.target.value)})}
                className="input-field"
                min="1"
                max="60"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sessions until Long Break
              </label>
              <input
                type="number"
                value={settings.sessionsUntilLongBreak}
                onChange={(e) => setSettings({...settings, sessionsUntilLongBreak: parseInt(e.target.value)})}
                className="input-field"
                min="2"
                max="10"
              />
            </div>
          </div>
          <button
            onClick={() => {
              setTimeLeft(sessionType === 'work' ? settings.workTime * 60 : 
                         sessionType === 'shortBreak' ? settings.shortBreak * 60 : settings.longBreak * 60)
              setShowSettings(false)
            }}
            className="btn-primary mt-4"
          >
            Apply Settings
          </button>
        </div>
      )}

      {/* Hidden audio element for notifications */}
      <audio
        ref={audioRef}
        preload="auto"
      >
        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT" type="audio/wav" />
      </audio>

      {/* Distraction Journal Modal */}
      <DistractionJournal
        isOpen={showDistractionJournal}
        onClose={() => setShowDistractionJournal(false)}
        onSubmit={handleDistractionSubmit}
      />
    </div>
  )
}

export default PomodoroTimer