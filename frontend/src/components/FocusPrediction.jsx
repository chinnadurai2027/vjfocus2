import React, { useState, useEffect } from 'react'
import { Brain, TrendingUp, Clock, Target } from 'lucide-react'
import { format, getHours, startOfWeek, endOfWeek, eachHourOfInterval } from 'date-fns'

const FocusPrediction = ({ pomodoroSessions, tasks }) => {
  const [predictions, setPredictions] = useState(null)
  const [insights, setInsights] = useState([])

  useEffect(() => {
    if (pomodoroSessions.length > 0 || tasks.length > 0) {
      analyzeFocusPatterns()
    }
  }, [pomodoroSessions, tasks])

  const analyzeFocusPatterns = () => {
    try {
      // Analyze hourly productivity
      const hourlyData = {}
      const dayData = {}
      
      // Initialize hourly data
      for (let hour = 0; hour < 24; hour++) {
        hourlyData[hour] = { sessions: 0, completedTasks: 0, score: 0 }
      }

      // Initialize daily data
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      days.forEach(day => {
        dayData[day] = { sessions: 0, completedTasks: 0, score: 0 }
      })

    // Analyze Pomodoro sessions
    pomodoroSessions.forEach(session => {
      if (session.type === 'work') {
        const date = new Date(session.completedAt)
        const hour = getHours(date)
        const day = days[date.getDay()]
        
        hourlyData[hour].sessions++
        dayData[day].sessions++
      }
    })

    // Analyze completed tasks
    tasks.filter(task => task.completed).forEach(task => {
      if (task.completed_at) {
        const date = new Date(task.completed_at)
        const hour = getHours(date)
        const day = days[date.getDay()]
        
        hourlyData[hour].completedTasks++
        dayData[day].completedTasks++
      }
    })

    // Calculate productivity scores
    Object.keys(hourlyData).forEach(hour => {
      const data = hourlyData[hour]
      data.score = (data.sessions * 2) + (data.completedTasks * 3) // Weight tasks higher
    })

    Object.keys(dayData).forEach(day => {
      const data = dayData[day]
      data.score = (data.sessions * 2) + (data.completedTasks * 3)
    })

    // Find peak hours and days
    const peakHours = Object.entries(hourlyData)
      .sort(([,a], [,b]) => b.score - a.score)
      .slice(0, 3)
      .filter(([,data]) => data.score > 0)

    const peakDays = Object.entries(dayData)
      .sort(([,a], [,b]) => b.score - a.score)
      .slice(0, 3)
      .filter(([,data]) => data.score > 0)

    // Generate insights
    const newInsights = []
    
    if (peakHours.length > 0) {
      const topHour = peakHours[0]
      const hourNum = parseInt(topHour[0])
      const timeStr = format(new Date().setHours(hourNum, 0, 0, 0), 'h:mm a')
      
      newInsights.push({
        type: 'peak_time',
        icon: '⏰',
        title: 'Peak Focus Time',
        message: `You're most productive around ${timeStr}`,
        suggestion: `Schedule your most important tasks for ${timeStr} tomorrow`,
        confidence: Math.min(95, topHour[1].score * 10)
      })
    }

    if (peakDays.length > 0) {
      const topDay = peakDays[0]
      newInsights.push({
        type: 'peak_day',
        icon: '📅',
        title: 'Best Day Pattern',
        message: `${topDay[0]}s are your most productive days`,
        suggestion: `Plan challenging tasks for ${topDay[0]}s`,
        confidence: Math.min(95, topDay[1].score * 8)
      })
    }

    // Session length analysis
    const avgSessionLength = pomodoroSessions.length > 0 
      ? pomodoroSessions.reduce((sum, s) => sum + s.duration, 0) / pomodoroSessions.length 
      : 25

    if (avgSessionLength > 30) {
      newInsights.push({
        type: 'session_length',
        icon: '⏱️',
        title: 'Extended Focus',
        message: `You work best with ${Math.round(avgSessionLength)}-minute sessions`,
        suggestion: 'Consider longer Pomodoro intervals for deep work',
        confidence: 80
      })
    } else if (avgSessionLength < 20) {
      newInsights.push({
        type: 'session_length',
        icon: '⚡',
        title: 'Quick Bursts',
        message: `You prefer shorter ${Math.round(avgSessionLength)}-minute focus sessions`,
        suggestion: 'Try micro-sessions for better concentration',
        confidence: 75
      })
    }

    // Consistency analysis
    const recentSessions = pomodoroSessions.slice(-7) // Last 7 sessions
    const sessionDays = new Set(recentSessions.map(s => format(new Date(s.completedAt), 'yyyy-MM-dd')))
    
    if (sessionDays.size >= 5) {
      newInsights.push({
        type: 'consistency',
        icon: '🔥',
        title: 'Consistency Streak',
        message: `You've been active ${sessionDays.size} days this week`,
        suggestion: 'Keep up the consistent daily practice!',
        confidence: 90
      })
    }

    setPredictions({
      peakHours: peakHours.map(([hour, data]) => ({
        hour: parseInt(hour),
        timeStr: format(new Date().setHours(parseInt(hour), 0, 0, 0), 'h:mm a'),
        score: data.score
      })),
      peakDays: peakDays.map(([day, data]) => ({
        day,
        score: data.score
      })),
      avgSessionLength: Math.round(avgSessionLength)
    })

    setInsights(newInsights)
    } catch (error) {
      console.error('Error analyzing focus patterns:', error)
      setInsights([{
        type: 'error',
        icon: '⚠️',
        title: 'Analysis Error',
        message: 'Unable to analyze patterns right now',
        suggestion: 'Try again after completing more sessions',
        confidence: 0
      }])
    }
  }

  const getNextFocusWindow = () => {
    try {
      if (!predictions?.peakHours?.length) return null
      
      const now = new Date()
      const currentHour = getHours(now)
      
      // Find next peak hour
      const nextPeakHour = predictions.peakHours.find(p => p.hour > currentHour) || predictions.peakHours[0]
      
      if (!nextPeakHour) return null
      
      const tomorrow = new Date(now)
      if (nextPeakHour.hour <= currentHour) {
        tomorrow.setDate(tomorrow.getDate() + 1)
      }
      tomorrow.setHours(nextPeakHour.hour, 0, 0, 0)
      
      return {
        time: format(tomorrow, 'h:mm a'),
        date: format(tomorrow, 'MMM dd'),
        isToday: format(tomorrow, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd')
      }
    } catch (error) {
      console.error('Error calculating next focus window:', error)
      return null
    }
  }

  const nextWindow = getNextFocusWindow()

  if (!predictions && insights.length === 0) {
    return (
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <Brain className="w-6 h-6 text-purple-600" />
          <h3 className="text-lg font-semibold">Focus Prediction AI</h3>
        </div>
        <div className="text-center py-12 text-gray-500">
          <Brain className="w-16 h-16 mx-auto mb-6 text-gray-400" />
          <h4 className="text-lg font-medium text-gray-700 mb-2">AI Learning Mode</h4>
          <p className="mb-4">Complete a few Pomodoro sessions and tasks to unlock AI insights!</p>
          <div className="bg-blue-50 rounded-lg p-4 max-w-md mx-auto mb-4">
            <p className="text-sm text-blue-800 mb-2">🤖 <strong>What I'll analyze:</strong></p>
            <ul className="text-sm text-blue-700 text-left space-y-1">
              <li>• Your most productive hours</li>
              <li>• Best days for focused work</li>
              <li>• Optimal session lengths</li>
              <li>• Consistency patterns</li>
            </ul>
          </div>
          
          {/* Progress indicator */}
          <div className="max-w-sm mx-auto">
            <div className="flex justify-between text-xs text-gray-600 mb-2">
              <span>Sessions: {pomodoroSessions.filter(s => s.type === 'work').length}/3</span>
              <span>Tasks: {tasks.filter(t => t.completed).length}/2</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${Math.min(100, ((pomodoroSessions.filter(s => s.type === 'work').length / 3) + (tasks.filter(t => t.completed).length / 2)) * 50)}%` 
                }}
              />
            </div>
          </div>
          
          <p className="text-sm mt-4 text-gray-600">Start a Pomodoro session to begin!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center space-x-2 mb-4">
        <Brain className="w-6 h-6 text-purple-600" />
        <h3 className="text-lg font-semibold">Focus Prediction AI</h3>
      </div>

      {nextWindow && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 mb-4 border border-purple-200">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="w-5 h-5 text-purple-600" />
            <span className="font-medium text-purple-900">Next Focus Window</span>
          </div>
          <p className="text-purple-800">
            {nextWindow.isToday ? 'Today' : nextWindow.date} at {nextWindow.time}
          </p>
          <p className="text-sm text-purple-600 mt-1">
            💡 Schedule your most important task for this time
          </p>
        </div>
      )}

      <div className="space-y-3">
        {insights.map((insight, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">{insight.icon}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-gray-900">{insight.title}</h4>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    {insight.confidence}% confident
                  </span>
                </div>
                <p className="text-gray-700 text-sm mb-2">{insight.message}</p>
                <p className="text-purple-600 text-sm font-medium">
                  💡 {insight.suggestion}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {predictions?.peakHours.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-2 flex items-center">
            <TrendingUp className="w-4 h-4 mr-2" />
            Your Peak Hours
          </h4>
          <div className="flex space-x-2">
            {predictions.peakHours.slice(0, 3).map((peak, index) => (
              <div key={index} className="bg-blue-50 px-3 py-1 rounded-full text-sm text-blue-800">
                {peak.timeStr}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default FocusPrediction