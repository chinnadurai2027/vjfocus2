import React, { useState, useEffect } from 'react'
import { Repeat, Plus, X, Calendar, TrendingUp } from 'lucide-react'
import { format, startOfWeek, addWeeks, getDay } from 'date-fns'

const TaskRepetitionAI = ({ tasks, onAddTask }) => {
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  useEffect(() => {
    if (tasks.length > 0) {
      analyzeTaskPatterns()
    }
  }, [tasks])

  const analyzeTaskPatterns = () => {
    // Group tasks by title (case-insensitive, similar titles)
    const taskGroups = {}
    const now = new Date()
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

    tasks.forEach(task => {
      const normalizedTitle = task.title.toLowerCase().trim()
      const createdDate = new Date(task.created_at)
      
      // Only analyze recent tasks
      if (createdDate > twoWeeksAgo) {
        if (!taskGroups[normalizedTitle]) {
          taskGroups[normalizedTitle] = []
        }
        taskGroups[normalizedTitle].push({
          ...task,
          dayOfWeek: getDay(createdDate),
          weekNumber: Math.floor((now - createdDate) / (7 * 24 * 60 * 60 * 1000))
        })
      }
    })

    // Find patterns
    const patterns = []
    Object.entries(taskGroups).forEach(([title, taskList]) => {
      if (taskList.length >= 2) { // Need at least 2 occurrences
        // Analyze day patterns
        const dayFrequency = {}
        const weeklyOccurrences = {}
        
        taskList.forEach(task => {
          dayFrequency[task.dayOfWeek] = (dayFrequency[task.dayOfWeek] || 0) + 1
          weeklyOccurrences[task.weekNumber] = (weeklyOccurrences[task.weekNumber] || 0) + 1
        })

        // Find most common day
        const mostCommonDay = Object.entries(dayFrequency)
          .sort(([,a], [,b]) => b - a)[0]

        if (mostCommonDay && mostCommonDay[1] >= 2) {
          const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
          const dayName = dayNames[parseInt(mostCommonDay[0])]
          
          // Check if we should suggest it for next week
          const lastTask = taskList.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]
          const daysSinceLastTask = Math.floor((now - new Date(lastTask.created_at)) / (24 * 60 * 60 * 1000))
          
          if (daysSinceLastTask >= 5) { // Haven't done it in 5+ days
            patterns.push({
              id: `pattern_${title.replace(/\s+/g, '_')}`,
              originalTitle: lastTask.title,
              frequency: taskList.length,
              dayName,
              dayOfWeek: parseInt(mostCommonDay[0]),
              lastDone: format(new Date(lastTask.created_at), 'MMM dd'),
              confidence: Math.min(95, (taskList.length / 4) * 100), // Max 95% confidence
              priority: lastTask.priority || 'medium',
              description: lastTask.description || ''
            })
          }
        }
      }
    })

    // Sort by confidence and frequency
    patterns.sort((a, b) => (b.confidence * b.frequency) - (a.confidence * a.frequency))
    setSuggestions(patterns.slice(0, 5)) // Top 5 suggestions
  }

  const addSuggestedTask = (suggestion) => {
    const nextWeek = addWeeks(startOfWeek(new Date()), 1)
    const suggestedDate = new Date(nextWeek)
    suggestedDate.setDate(suggestedDate.getDate() + suggestion.dayOfWeek)

    onAddTask({
      title: suggestion.originalTitle,
      description: suggestion.description,
      priority: suggestion.priority,
      dueDate: format(suggestedDate, 'yyyy-MM-dd')
    })

    // Remove suggestion after adding
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id))
  }

  const dismissSuggestion = (suggestionId) => {
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId))
  }

  if (suggestions.length === 0) {
    return null
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Repeat className="w-6 h-6 text-green-600" />
          <div>
            <h3 className="text-lg font-semibold">Task Repetition AI</h3>
            <p className="text-sm text-gray-600">Smart suggestions based on your patterns</p>
          </div>
        </div>
        <button
          onClick={() => setShowSuggestions(!showSuggestions)}
          className="text-sm text-green-600 hover:text-green-700 font-medium"
        >
          {showSuggestions ? 'Hide' : `${suggestions.length} suggestions`}
        </button>
      </div>

      {showSuggestions && (
        <div className="space-y-3">
          {suggestions.map((suggestion) => (
            <div key={suggestion.id} className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-green-900">
                      Weekly Pattern Detected
                    </span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      {suggestion.confidence}% confident
                    </span>
                  </div>
                  
                  <h4 className="font-medium text-gray-900 mb-1">
                    "{suggestion.originalTitle}"
                  </h4>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      📅 You often add this on <strong>{suggestion.dayName}s</strong>
                    </p>
                    <p>
                      🔄 Added <strong>{suggestion.frequency} times</strong> recently
                    </p>
                    <p>
                      ⏰ Last done: {suggestion.lastDone}
                    </p>
                  </div>

                  <p className="text-sm text-green-700 mt-2 font-medium">
                    💡 Want to auto-add it for next {suggestion.dayName}?
                  </p>
                </div>

                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => addSuggestedTask(suggestion)}
                    className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add</span>
                  </button>
                  <button
                    onClick={() => dismissSuggestion(suggestion.id)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          <div className="text-xs text-gray-500 text-center pt-2 border-t border-green-200">
            🤖 AI analyzes your task creation patterns from the last 2 weeks
          </div>
        </div>
      )}
    </div>
  )
}

export default TaskRepetitionAI