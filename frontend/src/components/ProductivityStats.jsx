import React, { useMemo } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isWithinInterval } from 'date-fns'
import { TrendingUp, CheckCircle, Clock, Target } from 'lucide-react'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement)

const ProductivityStats = ({ tasks, pomodoroSessions }) => {
  const stats = useMemo(() => {
    const now = new Date()
    const weekStart = startOfWeek(now)
    const weekEnd = endOfWeek(now)
    
    // Task statistics
    const completedTasks = tasks.filter(task => task.completed).length
    const totalTasks = tasks.length
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(1) : 0
    
    // Priority breakdown
    const priorityBreakdown = tasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1
      return acc
    }, {})
    
    // Pomodoro statistics
    const totalSessions = pomodoroSessions.length
    const workSessions = pomodoroSessions.filter(s => s.type === 'work').length
    const totalFocusTime = pomodoroSessions
      .filter(s => s.type === 'work')
      .reduce((acc, s) => acc + s.duration, 0)
    
    // Weekly data
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })
    const weeklyData = weekDays.map(day => {
      const dayStart = new Date(day.setHours(0, 0, 0, 0))
      const dayEnd = new Date(day.setHours(23, 59, 59, 999))
      
      const dayTasks = tasks.filter(task => {
        const completedAt = task.completed_at ? new Date(task.completed_at) : null
        return completedAt && isWithinInterval(completedAt, { start: dayStart, end: dayEnd })
      }).length
      
      const daySessions = pomodoroSessions.filter(session => {
        const sessionDate = new Date(session.completedAt)
        return isWithinInterval(sessionDate, { start: dayStart, end: dayEnd })
      }).length
      
      return {
        day: format(day, 'EEE'),
        tasks: dayTasks,
        sessions: daySessions
      }
    })
    
    return {
      completedTasks,
      totalTasks,
      completionRate,
      priorityBreakdown,
      totalSessions,
      workSessions,
      totalFocusTime,
      weeklyData
    }
  }, [tasks, pomodoroSessions])

  const weeklyChartData = {
    labels: stats.weeklyData.map(d => d.day),
    datasets: [
      {
        label: 'Completed Tasks',
        data: stats.weeklyData.map(d => d.tasks),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1
      },
      {
        label: 'Pomodoro Sessions',
        data: stats.weeklyData.map(d => d.sessions),
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 1
      }
    ]
  }

  const priorityChartData = {
    labels: ['High', 'Medium', 'Low'],
    datasets: [
      {
        data: [
          stats.priorityBreakdown.high || 0,
          stats.priorityBreakdown.medium || 0,
          stats.priorityBreakdown.low || 0
        ],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(34, 197, 94, 0.8)'
        ],
        borderColor: [
          'rgb(239, 68, 68)',
          'rgb(245, 158, 11)',
          'rgb(34, 197, 94)'
        ],
        borderWidth: 1
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  }

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Productivity Stats</h2>
        <div className="text-sm text-gray-600">
          Week of {format(startOfWeek(new Date()), 'MMM dd')} - {format(endOfWeek(new Date()), 'MMM dd')}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tasks Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.completedTasks}/{stats.totalTasks}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Target className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completionRate}%</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Focus Time</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.floor(stats.totalFocusTime / 60)}h {stats.totalFocusTime % 60}m
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pomodoro Sessions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.workSessions}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Weekly Activity</h3>
          <Bar data={weeklyChartData} options={chartOptions} />
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Task Priority Distribution</h3>
          {stats.totalTasks > 0 ? (
            <Doughnut data={priorityChartData} options={doughnutOptions} />
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <Target className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>No tasks to display</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {pomodoroSessions.slice(-5).reverse().map((session, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  session.type === 'work' ? 'bg-red-500' : 'bg-green-500'
                }`} />
                <span className="text-sm text-gray-900">
                  {session.type === 'work' ? 'Work Session' : 'Break'} ({session.duration} min)
                </span>
              </div>
              <span className="text-sm text-gray-500">
                {format(new Date(session.completedAt), 'MMM dd, HH:mm')}
              </span>
            </div>
          ))}
          {pomodoroSessions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p>No pomodoro sessions yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductivityStats