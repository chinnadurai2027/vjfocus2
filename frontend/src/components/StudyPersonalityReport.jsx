import React, { useState, useEffect } from 'react'
import { User, TrendingUp, Clock, Target, Brain, Star } from 'lucide-react'
import { getHours, format, differenceInDays } from 'date-fns'

const StudyPersonalityReport = ({ tasks, pomodoroSessions }) => {
  const [personality, setPersonality] = useState(null)
  const [showReport, setShowReport] = useState(false)

  useEffect(() => {
    if (tasks.length > 0 || pomodoroSessions.length > 0) {
      const daysSinceFirstActivity = getDaysSinceFirstActivity()
      if (daysSinceFirstActivity >= 7) {
        generatePersonalityReport()
      }
    }
  }, [tasks, pomodoroSessions])

  const getDaysSinceFirstActivity = () => {
    const allDates = [
      ...tasks.map(t => new Date(t.created_at)),
      ...pomodoroSessions.map(s => new Date(s.completedAt))
    ].sort((a, b) => a - b)

    if (allDates.length === 0) return 0
    return differenceInDays(new Date(), allDates[0])
  }

  const generatePersonalityReport = () => {
    // Analyze time patterns
    const hourlyActivity = {}
    for (let hour = 0; hour < 24; hour++) {
      hourlyActivity[hour] = 0
    }

    // Count activity by hour
    pomodoroSessions.forEach(session => {
      if (session.type === 'work') {
        const hour = getHours(new Date(session.completedAt))
        hourlyActivity[hour]++
      }
    })

    tasks.filter(t => t.completed && t.completed_at).forEach(task => {
      const hour = getHours(new Date(task.completed_at))
      hourlyActivity[hour]++
    })

    // Find peak hours
    const peakHour = Object.entries(hourlyActivity)
      .sort(([,a], [,b]) => b - a)[0]

    // Determine time preference
    const morningActivity = Object.entries(hourlyActivity)
      .filter(([hour]) => hour >= 6 && hour < 12)
      .reduce((sum, [,count]) => sum + count, 0)

    const afternoonActivity = Object.entries(hourlyActivity)
      .filter(([hour]) => hour >= 12 && hour < 18)
      .reduce((sum, [,count]) => sum + count, 0)

    const eveningActivity = Object.entries(hourlyActivity)
      .filter(([hour]) => hour >= 18 && hour < 24)
      .reduce((sum, [,count]) => sum + count, 0)

    const nightActivity = Object.entries(hourlyActivity)
      .filter(([hour]) => hour >= 0 && hour < 6)
      .reduce((sum, [,count]) => sum + count, 0)

    let timePersonality = 'Balanced'
    let timeEmoji = '⚖️'
    let timeDescription = 'You work consistently throughout the day'

    const maxActivity = Math.max(morningActivity, afternoonActivity, eveningActivity, nightActivity)
    if (maxActivity === morningActivity && morningActivity > 0) {
      timePersonality = 'Early Bird'
      timeEmoji = '🌅'
      timeDescription = 'You\'re most productive in the morning hours'
    } else if (maxActivity === afternoonActivity) {
      timePersonality = 'Afternoon Achiever'
      timeEmoji = '☀️'
      timeDescription = 'Your peak performance happens in the afternoon'
    } else if (maxActivity === eveningActivity) {
      timePersonality = 'Evening Warrior'
      timeEmoji = '🌆'
      timeDescription = 'You hit your stride in the evening'
    } else if (maxActivity === nightActivity) {
      timePersonality = 'Night Owl'
      timeEmoji = '🦉'
      timeDescription = 'You thrive during late-night hours'
    }

    // Analyze session patterns
    const workSessions = pomodoroSessions.filter(s => s.type === 'work')
    const avgSessionLength = workSessions.length > 0 
      ? workSessions.reduce((sum, s) => sum + s.duration, 0) / workSessions.length 
      : 25

    let focusPersonality = 'Standard Focuser'
    let focusEmoji = '🎯'
    let focusDescription = 'You work well with standard focus sessions'

    if (avgSessionLength > 35) {
      focusPersonality = 'Deep Diver'
      focusEmoji = '🏊‍♂️'
      focusDescription = 'You prefer long, uninterrupted focus sessions'
    } else if (avgSessionLength < 20) {
      focusPersonality = 'Sprint Master'
      focusEmoji = '⚡'
      focusDescription = 'You excel with short, intense bursts of focus'
    }

    // Analyze consistency
    const uniqueDays = new Set([
      ...tasks.map(t => format(new Date(t.created_at), 'yyyy-MM-dd')),
      ...pomodoroSessions.map(s => format(new Date(s.completedAt), 'yyyy-MM-dd'))
    ]).size

    const totalDays = getDaysSinceFirstActivity()
    const consistencyRate = totalDays > 0 ? (uniqueDays / totalDays) * 100 : 0

    let consistencyPersonality = 'Steady Worker'
    let consistencyEmoji = '📈'
    let consistencyDescription = 'You maintain a regular work rhythm'

    if (consistencyRate >= 80) {
      consistencyPersonality = 'Consistency Champion'
      consistencyEmoji = '🏆'
      consistencyDescription = 'You show up almost every day - incredible dedication!'
    } else if (consistencyRate >= 60) {
      consistencyPersonality = 'Regular Performer'
      consistencyEmoji = '📊'
      consistencyDescription = 'You maintain good consistency with occasional breaks'
    } else if (consistencyRate >= 40) {
      consistencyPersonality = 'Weekend Warrior'
      consistencyEmoji = '⚡'
      consistencyDescription = 'You prefer intensive work periods with breaks'
    } else {
      consistencyPersonality = 'Burst Worker'
      consistencyEmoji = '💥'
      consistencyDescription = 'You work in powerful, focused bursts'
    }

    // Analyze task completion patterns
    const completedTasks = tasks.filter(t => t.completed)
    const completionRate = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0

    let completionPersonality = 'Balanced Completer'
    let completionEmoji = '✅'
    let completionDescription = 'You have a healthy task completion rate'

    if (completionRate >= 90) {
      completionPersonality = 'Completion Perfectionist'
      completionEmoji = '🎯'
      completionDescription = 'You rarely leave tasks unfinished - amazing!'
    } else if (completionRate >= 70) {
      completionPersonality = 'Reliable Finisher'
      completionEmoji = '✅'
      completionDescription = 'You complete most of what you start'
    } else if (completionRate >= 50) {
      completionPersonality = 'Selective Completer'
      completionEmoji = '🎲'
      completionDescription = 'You focus on completing the most important tasks'
    } else {
      completionPersonality = 'Idea Generator'
      completionEmoji = '💡'
      completionDescription = 'You\'re great at starting projects and generating ideas'
    }

    // Generate overall personality
    const traits = [
      { category: 'Time Preference', type: timePersonality, emoji: timeEmoji, description: timeDescription },
      { category: 'Focus Style', type: focusPersonality, emoji: focusEmoji, description: focusDescription },
      { category: 'Consistency', type: consistencyPersonality, emoji: consistencyEmoji, description: consistencyDescription },
      { category: 'Completion Style', type: completionPersonality, emoji: completionEmoji, description: completionDescription }
    ]

    // Create overall personality title
    const personalityTitle = `${timePersonality} ${focusPersonality}`
    const personalitySubtitle = `${consistencyPersonality} • ${completionPersonality}`

    // Generate insights and recommendations
    const insights = []
    const recommendations = []

    if (timePersonality === 'Early Bird') {
      insights.push('You naturally align with traditional work schedules')
      recommendations.push('Schedule your most challenging tasks before 10 AM')
    } else if (timePersonality === 'Night Owl') {
      insights.push('You have a unique advantage for late-night productivity')
      recommendations.push('Protect your evening hours for deep work')
    }

    if (focusPersonality === 'Deep Diver') {
      insights.push('You can maintain concentration longer than most people')
      recommendations.push('Block out 45-60 minute focus sessions for complex tasks')
    } else if (focusPersonality === 'Sprint Master') {
      insights.push('You excel at rapid, focused execution')
      recommendations.push('Use 15-20 minute sprints with short breaks')
    }

    if (consistencyRate >= 80) {
      insights.push('Your consistency is your superpower')
      recommendations.push('Maintain your routine but add variety to prevent burnout')
    } else if (consistencyRate < 40) {
      insights.push('You work best in intensive bursts')
      recommendations.push('Plan for longer breaks between intense work periods')
    }

    setPersonality({
      title: personalityTitle,
      subtitle: personalitySubtitle,
      traits,
      insights,
      recommendations,
      stats: {
        totalDays,
        uniqueDays,
        consistencyRate: Math.round(consistencyRate),
        completionRate: Math.round(completionRate),
        avgSessionLength: Math.round(avgSessionLength),
        peakHour: peakHour ? format(new Date().setHours(parseInt(peakHour[0]), 0, 0, 0), 'h:mm a') : 'N/A',
        totalSessions: workSessions.length,
        totalTasks: tasks.length
      }
    })
  }

  if (!personality) {
    const daysLeft = Math.max(0, 7 - getDaysSinceFirstActivity())
    return (
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <User className="w-6 h-6 text-purple-600" />
          <h3 className="text-lg font-semibold">Study Personality Report</h3>
        </div>
        <div className="text-center py-8 text-gray-500">
          <Brain className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>Your personality report will be ready in {daysLeft} day{daysLeft !== 1 ? 's' : ''}!</p>
          <p className="text-sm mt-2">Keep using VJFocus2 to unlock your productivity profile.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <User className="w-6 h-6 text-purple-600" />
          <div>
            <h3 className="text-lg font-semibold">Study Personality Report</h3>
            <p className="text-sm text-gray-600">Your unique productivity profile</p>
          </div>
        </div>
        <button
          onClick={() => setShowReport(!showReport)}
          className="text-sm text-purple-600 hover:text-purple-700 font-medium"
        >
          {showReport ? 'Hide Report' : 'View Report'}
        </button>
      </div>

      {/* Personality Title Card */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-6 mb-6 text-center border border-purple-200">
        <div className="text-4xl mb-2">🧠</div>
        <h2 className="text-2xl font-bold text-purple-900 mb-1">{personality.title}</h2>
        <p className="text-purple-700">{personality.subtitle}</p>
        <div className="mt-4 text-sm text-purple-600">
          Based on {personality.stats.totalDays} days of activity
        </div>
      </div>

      {showReport && (
        <div className="space-y-6">
          {/* Personality Traits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {personality.traits.map((trait, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-2xl">{trait.emoji}</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">{trait.type}</h4>
                    <p className="text-xs text-gray-600">{trait.category}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700">{trait.description}</p>
              </div>
            ))}
          </div>

          {/* Stats Overview */}
          <div className="bg-indigo-50 rounded-lg p-4">
            <h4 className="font-semibold text-indigo-900 mb-3 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Your Numbers
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-indigo-900">{personality.stats.consistencyRate}%</div>
                <div className="text-xs text-indigo-700">Consistency</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-indigo-900">{personality.stats.completionRate}%</div>
                <div className="text-xs text-indigo-700">Completion</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-indigo-900">{personality.stats.avgSessionLength}m</div>
                <div className="text-xs text-indigo-700">Avg Session</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-indigo-900">{personality.stats.peakHour}</div>
                <div className="text-xs text-indigo-700">Peak Hour</div>
              </div>
            </div>
          </div>

          {/* Insights */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Brain className="w-4 h-4 mr-2" />
              Key Insights
            </h4>
            <div className="space-y-2">
              {personality.insights.map((insight, index) => (
                <div key={index} className="flex items-start space-x-2 bg-blue-50 p-3 rounded">
                  <Star className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-800">{insight}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Target className="w-4 h-4 mr-2" />
              Personalized Recommendations
            </h4>
            <div className="space-y-2">
              {personality.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start space-x-2 bg-green-50 p-3 rounded">
                  <Target className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-green-800">{rec}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              🧑‍🎓 Your personality evolves as you use VJFocus2 • Updated weekly
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default StudyPersonalityReport