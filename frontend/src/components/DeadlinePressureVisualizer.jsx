import React, { useState, useEffect } from 'react'
import { AlertTriangle, Clock, Flame } from 'lucide-react'
import { differenceInDays, differenceInHours, format, isPast, isToday, isTomorrow } from 'date-fns'

const DeadlinePressureVisualizer = ({ tasks }) => {
  const [urgentTasks, setUrgentTasks] = useState([])

  useEffect(() => {
    analyzeDeadlines()
  }, [tasks])

  const analyzeDeadlines = () => {
    const now = new Date()
    
    const tasksWithDeadlines = tasks
      .filter(task => task.due_date && !task.completed)
      .map(task => {
        const dueDate = new Date(task.due_date)
        const daysUntilDue = differenceInDays(dueDate, now)
        const hoursUntilDue = differenceInHours(dueDate, now)
        
        let urgencyLevel = 'low'
        let urgencyColor = 'green'
        let urgencyMessage = ''
        let animationClass = ''

        if (isPast(dueDate)) {
          urgencyLevel = 'overdue'
          urgencyColor = 'red'
          urgencyMessage = `Overdue by ${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) !== 1 ? 's' : ''}`
          animationClass = 'animate-pulse bg-red-100 border-red-500'
        } else if (isToday(dueDate)) {
          urgencyLevel = 'critical'
          urgencyColor = 'red'
          urgencyMessage = `Due today (${hoursUntilDue}h left)`
          animationClass = 'animate-bounce bg-red-50 border-red-400'
        } else if (isTomorrow(dueDate)) {
          urgencyLevel = 'high'
          urgencyColor = 'orange'
          urgencyMessage = 'Due tomorrow'
          animationClass = 'bg-orange-50 border-orange-400'
        } else if (daysUntilDue <= 3) {
          urgencyLevel = 'medium'
          urgencyColor = 'yellow'
          urgencyMessage = `${daysUntilDue} days left`
          animationClass = 'bg-yellow-50 border-yellow-400'
        } else if (daysUntilDue <= 7) {
          urgencyLevel = 'low'
          urgencyColor = 'blue'
          urgencyMessage = `${daysUntilDue} days left`
          animationClass = 'bg-blue-50 border-blue-300'
        } else {
          urgencyLevel = 'none'
          urgencyColor = 'gray'
          urgencyMessage = `${daysUntilDue} days left`
          animationClass = 'bg-gray-50 border-gray-300'
        }

        return {
          ...task,
          daysUntilDue,
          hoursUntilDue,
          urgencyLevel,
          urgencyColor,
          urgencyMessage,
          animationClass,
          pressureScore: calculatePressureScore(daysUntilDue, task.priority)
        }
      })
      .sort((a, b) => b.pressureScore - a.pressureScore) // Sort by pressure score

    setUrgentTasks(tasksWithDeadlines.slice(0, 10)) // Show top 10 most urgent
  }

  const calculatePressureScore = (daysUntilDue, priority) => {
    let timeScore = 0
    if (daysUntilDue < 0) timeScore = 100 // Overdue
    else if (daysUntilDue === 0) timeScore = 90 // Today
    else if (daysUntilDue === 1) timeScore = 80 // Tomorrow
    else if (daysUntilDue <= 3) timeScore = 60 // 2-3 days
    else if (daysUntilDue <= 7) timeScore = 40 // Week
    else timeScore = Math.max(0, 30 - daysUntilDue) // Decreasing

    const priorityMultiplier = {
      'high': 1.5,
      'medium': 1.2,
      'low': 1.0
    }

    return timeScore * (priorityMultiplier[priority] || 1.0)
  }

  const getUrgencyIcon = (urgencyLevel) => {
    switch (urgencyLevel) {
      case 'overdue':
      case 'critical':
        return <Flame className="w-5 h-5" />
      case 'high':
      case 'medium':
        return <AlertTriangle className="w-5 h-5" />
      default:
        return <Clock className="w-5 h-5" />
    }
  }

  const getPressureBar = (pressureScore) => {
    const percentage = Math.min(100, pressureScore)
    let barColor = 'bg-green-500'
    
    if (percentage >= 80) barColor = 'bg-red-500'
    else if (percentage >= 60) barColor = 'bg-orange-500'
    else if (percentage >= 40) barColor = 'bg-yellow-500'
    else if (percentage >= 20) barColor = 'bg-blue-500'

    return (
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div 
          className={`h-full transition-all duration-500 ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    )
  }

  if (urgentTasks.length === 0) {
    return (
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <Clock className="w-6 h-6 text-green-600" />
          <h3 className="text-lg font-semibold">Deadline Pressure</h3>
        </div>
        <div className="text-center py-8 text-gray-500">
          <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>No upcoming deadlines!</p>
          <p className="text-sm mt-2">You're all caught up. Great job! 🎉</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-6 h-6 text-orange-600" />
          <div>
            <h3 className="text-lg font-semibold">Deadline Pressure</h3>
            <p className="text-sm text-gray-600">Visual urgency indicators</p>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          {urgentTasks.filter(t => t.urgencyLevel === 'overdue' || t.urgencyLevel === 'critical').length} urgent
        </div>
      </div>

      <div className="space-y-3">
        {urgentTasks.map((task) => (
          <div
            key={task.id}
            className={`border-2 rounded-lg p-4 transition-all duration-300 ${task.animationClass}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <div className={`text-${task.urgencyColor}-600`}>
                    {getUrgencyIcon(task.urgencyLevel)}
                  </div>
                  <h4 className={`font-medium text-${task.urgencyColor}-900`}>
                    {task.title}
                  </h4>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full bg-${task.urgencyColor}-100 text-${task.urgencyColor}-800`}>
                    {task.priority}
                  </span>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium text-${task.urgencyColor}-700`}>
                    {task.urgencyMessage}
                  </span>
                  <span className="text-xs text-gray-500">
                    Due: {format(new Date(task.due_date), 'MMM dd, yyyy')}
                  </span>
                </div>

                {/* Pressure Bar */}
                <div className="mb-2">
                  {getPressureBar(task.pressureScore)}
                </div>

                {task.description && (
                  <p className="text-sm text-gray-600 mt-2">
                    {task.description}
                  </p>
                )}
              </div>
            </div>

            {/* Urgency-specific messages */}
            {task.urgencyLevel === 'overdue' && (
              <div className="mt-3 p-2 bg-red-100 border border-red-300 rounded text-sm text-red-800">
                🚨 This task is overdue! Consider breaking it into smaller parts or adjusting the deadline.
              </div>
            )}
            {task.urgencyLevel === 'critical' && (
              <div className="mt-3 p-2 bg-orange-100 border border-orange-300 rounded text-sm text-orange-800">
                ⚡ Due today! This should be your top priority right now.
              </div>
            )}
            {task.urgencyLevel === 'high' && (
              <div className="mt-3 p-2 bg-yellow-100 border border-yellow-300 rounded text-sm text-yellow-800">
                ⏰ Due tomorrow! Plan your time accordingly.
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-red-600">
              {urgentTasks.filter(t => t.urgencyLevel === 'overdue').length}
            </div>
            <div className="text-xs text-gray-600">Overdue</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">
              {urgentTasks.filter(t => t.urgencyLevel === 'critical').length}
            </div>
            <div className="text-xs text-gray-600">Today</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-600">
              {urgentTasks.filter(t => t.urgencyLevel === 'high').length}
            </div>
            <div className="text-xs text-gray-600">Tomorrow</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {urgentTasks.filter(t => t.urgencyLevel === 'medium').length}
            </div>
            <div className="text-xs text-gray-600">This Week</div>
          </div>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        💡 Tasks with closer deadlines and higher priority get more visual emphasis
      </div>
    </div>
  )
}

export default DeadlinePressureVisualizer