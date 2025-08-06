import React, { useState } from 'react'
import { X, Calendar, Clock, Video, Users } from 'lucide-react'
import axios from 'axios'
import { format, addDays, startOfDay } from 'date-fns'

const MeetingScheduler = ({ isOpen, onClose, group, onMeetingCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
    time: '19:00',
    durationMinutes: 60
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const durationOptions = [
    { value: 30, label: '30 minutes' },
    { value: 45, label: '45 minutes' },
    { value: 60, label: '1 hour' },
    { value: 90, label: '1.5 hours' },
    { value: 120, label: '2 hours' },
    { value: 180, label: '3 hours' }
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!formData.title.trim()) {
      setError('Meeting title is required')
      setLoading(false)
      return
    }

    try {
      // Combine date and time
      const scheduledAt = new Date(`${formData.date}T${formData.time}:00`)
      
      // Check if the time is in the future
      if (scheduledAt <= new Date()) {
        setError('Meeting must be scheduled for a future time')
        setLoading(false)
        return
      }

      const meetingData = {
        groupId: group.id,
        title: formData.title,
        description: formData.description,
        scheduledAt: scheduledAt.toISOString(),
        durationMinutes: formData.durationMinutes
      }

      const response = await axios.post('/meetings', meetingData, {
        withCredentials: true
      })

      onMeetingCreated(response.data)
      onClose()
      resetForm()
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to schedule meeting')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
      time: '19:00',
      durationMinutes: 60
    })
    setError('')
  }

  const generateMeetingTitle = () => {
    const suggestions = [
      `${group.name} Study Session`,
      `${group.category} Discussion`,
      `Weekly ${group.name} Meetup`,
      `${group.name} Collaboration`,
      `Study Group Check-in`,
      `${group.name} Progress Review`
    ]
    
    const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)]
    setFormData({ ...formData, title: randomSuggestion })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Calendar className="w-6 h-6 text-green-600" />
            <div>
              <h3 className="text-xl font-semibold">Schedule Meeting</h3>
              <p className="text-sm text-gray-600">{group.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Meeting Title */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Meeting Title *
              </label>
              <button
                type="button"
                onClick={generateMeetingTitle}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                Suggest title
              </button>
            </div>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Weekly Study Session"
              className="input-field"
              maxLength={200}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What will you discuss? Any preparation needed?"
              className="input-field"
              rows="3"
              maxLength={500}
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                min={format(new Date(), 'yyyy-MM-dd')}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time *
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="input-field"
                required
              />
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration
            </label>
            <select
              value={formData.durationMinutes}
              onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) })}
              className="input-field"
            >
              {durationOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Meeting Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
              <Video className="w-4 h-4 mr-2" />
              Meeting Preview
            </h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>
                  {format(new Date(`${formData.date}T${formData.time}`), 'EEEE, MMMM dd, yyyy')}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>
                  {format(new Date(`${formData.date}T${formData.time}`), 'h:mm a')} 
                  ({formData.durationMinutes} minutes)
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>All {group.member_count} group members will be invited</span>
              </div>
            </div>
          </div>

          {/* Google Meet Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <Video className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Google Meet Integration</p>
                <p className="text-xs">
                  A unique Google Meet link will be automatically generated for this meeting. 
                  All group members will receive the link and can join directly from their dashboard.
                </p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={loading || !formData.title.trim()}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Scheduling...' : 'Schedule Meeting'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>

        {/* Quick Schedule Options */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-2">Quick Schedule:</p>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Tomorrow 7 PM', date: addDays(new Date(), 1), time: '19:00' },
              { label: 'This Weekend', date: addDays(new Date(), 6), time: '14:00' },
              { label: 'Next Week', date: addDays(new Date(), 7), time: '19:00' }
            ].map((option, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setFormData({
                  ...formData,
                  date: format(option.date, 'yyyy-MM-dd'),
                  time: option.time
                })}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MeetingScheduler