import React, { useState, useEffect, useRef } from 'react'
import { Package, Download, Calendar, CheckCircle, Clock, TrendingUp, Star } from 'lucide-react'
import { format, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns'

const WeeklyTaskCapsule = ({ tasks, pomodoroSessions }) => {
  const [weeklyData, setWeeklyData] = useState(null)
  const [showCapsule, setShowCapsule] = useState(false)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const capsuleRef = useRef(null)

  useEffect(() => {
    generateWeeklyCapsule()
  }, [tasks, pomodoroSessions])

  const generateWeeklyCapsule = () => {
    const now = new Date()
    const weekStart = startOfWeek(now)
    const weekEnd = endOfWeek(now)

    // Filter this week's data
    const thisWeekTasks = tasks.filter(task => {
      const createdDate = new Date(task.created_at)
      return isWithinInterval(createdDate, { start: weekStart, end: weekEnd })
    })

    const thisWeekSessions = pomodoroSessions.filter(session => {
      const sessionDate = new Date(session.completedAt)
      return isWithinInterval(sessionDate, { start: weekStart, end: weekEnd })
    })

    const completedTasks = thisWeekTasks.filter(task => task.completed)
    const workSessions = thisWeekSessions.filter(s => s.type === 'work')
    const totalFocusTime = workSessions.reduce((sum, s) => sum + s.duration, 0)

    // Calculate productivity metrics
    const completionRate = thisWeekTasks.length > 0 
      ? Math.round((completedTasks.length / thisWeekTasks.length) * 100)
      : 0

    // Priority breakdown
    const priorityStats = completedTasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1
      return acc
    }, {})

    // Daily breakdown
    const dailyStats = {}
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart)
      day.setDate(day.getDate() + i)
      const dayKey = format(day, 'EEE')
      
      const dayTasks = completedTasks.filter(task => {
        if (!task.completed_at) return false
        const completedDate = new Date(task.completed_at)
        return format(completedDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
      }).length

      const daySessions = workSessions.filter(session => {
        const sessionDate = new Date(session.completedAt)
        return format(sessionDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
      }).length

      dailyStats[dayKey] = { tasks: dayTasks, sessions: daySessions }
    }

    // Find best day
    const bestDay = Object.entries(dailyStats)
      .sort(([,a], [,b]) => (b.tasks + b.sessions) - (a.tasks + a.sessions))[0]

    // Generate insights
    const insights = []
    
    if (completionRate >= 80) {
      insights.push("🎯 Excellent completion rate! You're crushing your goals.")
    } else if (completionRate >= 60) {
      insights.push("👍 Good progress this week. Keep up the momentum!")
    } else if (completionRate >= 40) {
      insights.push("📈 Room for improvement. Consider smaller, more achievable tasks.")
    } else {
      insights.push("🎯 Focus on completing fewer tasks but doing them well.")
    }

    if (totalFocusTime >= 300) { // 5+ hours
      insights.push(`⏰ Amazing focus time: ${Math.round(totalFocusTime / 60)} hours of deep work!`)
    } else if (totalFocusTime >= 120) { // 2+ hours
      insights.push(`⏰ Good focus time: ${Math.round(totalFocusTime / 60)} hours of concentrated work.`)
    }

    if (workSessions.length >= 10) {
      insights.push("🔥 Consistency champion! You maintained regular Pomodoro sessions.")
    }

    if (bestDay && (bestDay[1].tasks + bestDay[1].sessions) > 0) {
      insights.push(`⭐ ${bestDay[0]} was your most productive day!`)
    }

    // Reflection prompts
    const reflectionPrompts = [
      "What was your biggest accomplishment this week?",
      "What distracted you the most, and how can you avoid it?",
      "Which task took longer than expected, and why?",
      "What would you do differently next week?",
      "What are you most proud of from this week?"
    ]

    setWeeklyData({
      weekRange: `${format(weekStart, 'MMM dd')} - ${format(weekEnd, 'MMM dd, yyyy')}`,
      totalTasks: thisWeekTasks.length,
      completedTasks: completedTasks.length,
      completionRate,
      totalFocusTime,
      workSessions: workSessions.length,
      priorityStats,
      dailyStats,
      bestDay: bestDay ? bestDay[0] : null,
      insights,
      reflectionPrompts: reflectionPrompts.slice(0, 3), // Show 3 random prompts
      completedTasksList: completedTasks.slice(0, 5).map(task => ({
        title: task.title,
        priority: task.priority,
        completedAt: task.completed_at
      }))
    })
  }

  const downloadCapsule = async () => {
    if (!weeklyData) return
    
    setIsGeneratingPDF(true)
    
    try {
      // Dynamic import to avoid build issues
      const jsPDF = (await import('jspdf')).default
      const html2canvas = (await import('html2canvas')).default
      
      // Create a temporary container for PDF content
      const pdfContent = document.createElement('div')
      pdfContent.style.cssText = `
        position: absolute;
        left: -9999px;
        top: 0;
        width: 800px;
        padding: 40px;
        background: white;
        font-family: Arial, sans-serif;
        color: #333;
      `
      
      pdfContent.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #6366f1; margin-bottom: 10px; font-size: 28px;">📦 Weekly Productivity Capsule</h1>
          <h2 style="color: #666; margin: 0; font-size: 18px;">${weeklyData.weekRange}</h2>
          <p style="color: #888; margin: 10px 0; font-size: 14px;">Generated by VJFocus2</p>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px;">
          <div style="text-align: center; padding: 20px; background: #dbeafe; border-radius: 8px;">
            <div style="font-size: 32px; font-weight: bold; color: #1e40af;">${weeklyData.completedTasks}</div>
            <div style="font-size: 12px; color: #1e40af;">Tasks Done</div>
          </div>
          <div style="text-align: center; padding: 20px; background: #dcfce7; border-radius: 8px;">
            <div style="font-size: 32px; font-weight: bold; color: #166534;">${weeklyData.completionRate}%</div>
            <div style="font-size: 12px; color: #166534;">Completion</div>
          </div>
          <div style="text-align: center; padding: 20px; background: #f3e8ff; border-radius: 8px;">
            <div style="font-size: 32px; font-weight: bold; color: #7c3aed;">${Math.round(weeklyData.totalFocusTime / 60)}h</div>
            <div style="font-size: 12px; color: #7c3aed;">Focus Time</div>
          </div>
          <div style="text-align: center; padding: 20px; background: #fed7aa; border-radius: 8px;">
            <div style="font-size: 32px; font-weight: bold; color: #ea580c;">${weeklyData.bestDay || 'N/A'}</div>
            <div style="font-size: 12px; color: #ea580c;">Best Day</div>
          </div>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h3 style="color: #6366f1; margin-bottom: 15px; font-size: 20px;">💡 Week Insights</h3>
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #6366f1;">
            ${weeklyData.insights.map(insight => `<p style="margin: 8px 0; font-size: 14px;">• ${insight}</p>`).join('')}
          </div>
        </div>
        
        ${weeklyData.completedTasksList.length > 0 ? `
        <div style="margin-bottom: 30px;">
          <h3 style="color: #059669; margin-bottom: 15px; font-size: 20px;">✅ This Week's Wins</h3>
          <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #059669;">
            ${weeklyData.completedTasksList.map(task => 
              `<div style="margin: 8px 0; padding: 8px; background: white; border-radius: 4px; font-size: 14px;">
                <strong>${task.title}</strong> <span style="color: #666;">(${task.priority} priority)</span>
              </div>`
            ).join('')}
          </div>
        </div>
        ` : ''}
        
        <div style="margin-bottom: 30px;">
          <h3 style="color: #d97706; margin-bottom: 15px; font-size: 20px;">🤔 Weekly Reflection</h3>
          <div style="background: #fffbeb; padding: 20px; border-radius: 8px; border-left: 4px solid #d97706;">
            ${weeklyData.reflectionPrompts.map((prompt, i) => 
              `<div style="margin: 15px 0;">
                <p style="font-weight: bold; margin-bottom: 8px; font-size: 14px;">${i + 1}. ${prompt}</p>
                <div style="height: 60px; border: 1px solid #d1d5db; border-radius: 4px; background: white;"></div>
              </div>`
            ).join('')}
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb;">
          <p style="color: #888; font-size: 12px;">Generated on ${format(new Date(), 'PPP')} by VJFocus2</p>
          <p style="color: #888; font-size: 12px;">Your productivity companion 🎯</p>
        </div>
      `
      
      document.body.appendChild(pdfContent)
      
      // Generate canvas from HTML
      const canvas = await html2canvas(pdfContent, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      })
      
      // Remove temporary element
      document.body.removeChild(pdfContent)
      
      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4')
      const imgData = canvas.toDataURL('image/png')
      
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
      const imgX = (pdfWidth - imgWidth * ratio) / 2
      const imgY = 0
      
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio)
      
      // Download PDF
      pdf.save(`weekly-capsule-${format(new Date(), 'yyyy-MM-dd')}.pdf`)
      
    } catch (error) {
      console.error('Error generating PDF:', error)
      // Fallback to text download
      const capsuleText = `
🗓️ WEEKLY PRODUCTIVITY CAPSULE
${weeklyData.weekRange}

📊 WEEK SUMMARY
• Tasks Created: ${weeklyData.totalTasks}
• Tasks Completed: ${weeklyData.completedTasks}
• Completion Rate: ${weeklyData.completionRate}%
• Focus Time: ${Math.round(weeklyData.totalFocusTime / 60)}h ${weeklyData.totalFocusTime % 60}m
• Pomodoro Sessions: ${weeklyData.workSessions}
• Best Day: ${weeklyData.bestDay || 'N/A'}

✅ COMPLETED TASKS
${weeklyData.completedTasksList.map(task => 
  `• ${task.title} (${task.priority} priority)`
).join('\n')}

💡 INSIGHTS
${weeklyData.insights.map(insight => `• ${insight}`).join('\n')}

🤔 REFLECTION QUESTIONS
${weeklyData.reflectionPrompts.map((prompt, i) => `${i + 1}. ${prompt}`).join('\n')}

Generated by VJFocus2 on ${format(new Date(), 'PPP')}
      `.trim()

      const blob = new Blob([capsuleText], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `weekly-capsule-${format(new Date(), 'yyyy-MM-dd')}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  if (!weeklyData || (weeklyData.totalTasks === 0 && weeklyData.workSessions === 0)) {
    return null
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Package className="w-6 h-6 text-indigo-600" />
          <div>
            <h3 className="text-lg font-semibold">Weekly Task Capsule</h3>
            <p className="text-sm text-gray-600">{weeklyData.weekRange}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={downloadCapsule}
            disabled={isGeneratingPDF}
            className="flex items-center space-x-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            <span>{isGeneratingPDF ? 'Generating PDF...' : 'Download PDF'}</span>
          </button>
          <button
            onClick={() => setShowCapsule(!showCapsule)}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            {showCapsule ? 'Hide' : 'View Capsule'}
          </button>
        </div>
      </div>

      {showCapsule && (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <CheckCircle className="w-6 h-6 text-blue-600 mx-auto mb-1" />
              <div className="text-2xl font-bold text-blue-900">{weeklyData.completedTasks}</div>
              <div className="text-xs text-blue-700">Tasks Done</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-1" />
              <div className="text-2xl font-bold text-green-900">{weeklyData.completionRate}%</div>
              <div className="text-xs text-green-700">Completion</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 text-center">
              <Clock className="w-6 h-6 text-purple-600 mx-auto mb-1" />
              <div className="text-2xl font-bold text-purple-900">
                {Math.round(weeklyData.totalFocusTime / 60)}h
              </div>
              <div className="text-xs text-purple-700">Focus Time</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 text-center">
              <Star className="w-6 h-6 text-orange-600 mx-auto mb-1" />
              <div className="text-2xl font-bold text-orange-900">{weeklyData.bestDay || 'N/A'}</div>
              <div className="text-xs text-orange-700">Best Day</div>
            </div>
          </div>

          {/* Insights */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4">
            <h4 className="font-semibold text-indigo-900 mb-3 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Week Insights
            </h4>
            <div className="space-y-2">
              {weeklyData.insights.map((insight, index) => (
                <p key={index} className="text-sm text-indigo-800">
                  {insight}
                </p>
              ))}
            </div>
          </div>

          {/* Completed Tasks */}
          {weeklyData.completedTasksList.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">✅ This Week's Wins</h4>
              <div className="space-y-2">
                {weeklyData.completedTasksList.map((task, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 rounded p-2">
                    <span className="text-sm text-gray-900">{task.title}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      task.priority === 'high' ? 'bg-red-100 text-red-800' :
                      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reflection Prompts */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">🤔 Weekly Reflection</h4>
            <div className="space-y-3">
              {weeklyData.reflectionPrompts.map((prompt, index) => (
                <div key={index} className="bg-yellow-50 border-l-4 border-yellow-400 p-3">
                  <p className="text-sm text-yellow-800 font-medium">
                    {index + 1}. {prompt}
                  </p>
                  <textarea
                    placeholder="Your thoughts..."
                    className="w-full mt-2 p-2 text-sm border border-yellow-200 rounded resize-none focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    rows="2"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              📦 Your weekly productivity capsule • Generated on {format(new Date(), 'PPP')}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default WeeklyTaskCapsule