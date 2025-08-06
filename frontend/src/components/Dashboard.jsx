import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import TaskManager from './TaskManager'
import PomodoroTimer from './PomodoroTimer'
import ProductivityStats from './ProductivityStats'
import MindDumpPad from './MindDumpPad'
import AmbientSounds from './AmbientSounds'
import FocusPrediction from './FocusPrediction'
import WeeklyTaskCapsule from './WeeklyTaskCapsule'
import StudyPersonalityReport from './StudyPersonalityReport'
import SocialDashboard from './SocialDashboard'
import NotificationCenter from './NotificationCenter'
import { LogOut, BarChart3, CheckSquare, Timer, Brain, Volume2, Package, User, Users } from 'lucide-react'
import axios from 'axios'

const Dashboard = () => {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('tasks')
  const [tasks, setTasks] = useState([])
  const [pomodoroSessions, setPomodoroSessions] = useState([])
  const [isTimerActive, setIsTimerActive] = useState(false)

  useEffect(() => {
    fetchPomodoroSessions()
  }, [])

  const fetchPomodoroSessions = async () => {
    try {
      const response = await axios.get('/tasks/pomodoro-sessions', { withCredentials: true })
      setPomodoroSessions(response.data)
    } catch (error) {
      console.error('Error fetching pomodoro sessions:', error)
    }
  }

  const tabs = [
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'pomodoro', label: 'Pomodoro', icon: Timer },
    { id: 'social', label: 'Social', icon: Users },
    { id: 'focus', label: 'Focus AI', icon: Brain },
    { id: 'ambient', label: 'Sounds', icon: Volume2 },
    { id: 'personality', label: 'Profile', icon: User },
    { id: 'capsule', label: 'Capsule', icon: Package },
    { id: 'stats', label: 'Stats', icon: BarChart3 }
  ]

  const handleLogout = async () => {
    await logout()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">VJFocus2</h1>
              <span className="ml-4 text-gray-600">Welcome, {user?.username}</span>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationCenter />
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'tasks' && (
          <div className="space-y-6">
            <MindDumpPad />
            <TaskManager 
              tasks={tasks} 
              setTasks={setTasks}
            />
          </div>
        )}
        {activeTab === 'pomodoro' && (
          <PomodoroTimer 
            onSessionComplete={(session) => {
              setPomodoroSessions(prev => [...prev, session])
              fetchPomodoroSessions() // Refresh from database
            }}
            onTimerStateChange={setIsTimerActive}
          />
        )}
        {activeTab === 'social' && (
          <SocialDashboard />
        )}
        {activeTab === 'focus' && (
          <FocusPrediction 
            pomodoroSessions={pomodoroSessions}
            tasks={tasks}
          />
        )}
        {activeTab === 'ambient' && (
          <AmbientSounds 
            isTimerActive={isTimerActive}
          />
        )}
        {activeTab === 'personality' && (
          <StudyPersonalityReport 
            tasks={tasks}
            pomodoroSessions={pomodoroSessions}
          />
        )}
        {activeTab === 'capsule' && (
          <WeeklyTaskCapsule 
            tasks={tasks}
            pomodoroSessions={pomodoroSessions}
          />
        )}
        {activeTab === 'stats' && (
          <ProductivityStats 
            tasks={tasks}
            pomodoroSessions={pomodoroSessions}
          />
        )}
      </main>
    </div>
  )
}

export default Dashboard