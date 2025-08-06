import React, { useState, useEffect } from 'react'
import { User, Save, Globe, Lock, Clock, BookOpen, X } from 'lucide-react'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'

const UserProfileEditor = ({ isOpen, onClose, onProfileUpdated }) => {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    studyInterests: [],
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    preferredStudyTimes: [],
    isPublic: true
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [newInterest, setNewInterest] = useState('')
  const [profileData, setProfileData] = useState(null)

  const studyTimeOptions = [
    'Early Morning (5-8 AM)',
    'Morning (8-11 AM)',
    'Late Morning (11 AM-1 PM)',
    'Afternoon (1-4 PM)',
    'Late Afternoon (4-7 PM)',
    'Evening (7-10 PM)',
    'Late Evening (10 PM-12 AM)',
    'Night (12-3 AM)',
    'Late Night (3-5 AM)'
  ]

  const popularInterests = [
    'JavaScript', 'Python', 'React', 'Node.js', 'Machine Learning',
    'Data Science', 'Web Development', 'Mobile Development', 'DevOps',
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
    'Business', 'Marketing', 'Design', 'Photography', 'Languages',
    'Literature', 'History', 'Psychology', 'Medicine', 'Engineering'
  ]

  useEffect(() => {
    if (isOpen && user) {
      fetchProfile()
    }
  }, [isOpen, user])

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/social/profile', {
        withCredentials: true
      })
      
      const profile = response.data
      setProfileData(profile)
      setFormData({
        displayName: profile.display_name || '',
        bio: profile.bio || '',
        studyInterests: profile.study_interests || [],
        timezone: profile.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        preferredStudyTimes: profile.preferred_study_times || [],
        isPublic: profile.is_public !== false
      })
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await axios.put('/social/profile', formData, {
        withCredentials: true
      })

      onProfileUpdated(response.data)
      onClose()
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const addInterest = () => {
    if (newInterest.trim() && !formData.studyInterests.includes(newInterest.trim())) {
      setFormData({
        ...formData,
        studyInterests: [...formData.studyInterests, newInterest.trim()]
      })
      setNewInterest('')
    }
  }

  const removeInterest = (interest) => {
    setFormData({
      ...formData,
      studyInterests: formData.studyInterests.filter(i => i !== interest)
    })
  }

  const addPopularInterest = (interest) => {
    if (!formData.studyInterests.includes(interest)) {
      setFormData({
        ...formData,
        studyInterests: [...formData.studyInterests, interest]
      })
    }
  }

  const toggleStudyTime = (time) => {
    const isSelected = formData.preferredStudyTimes.includes(time)
    if (isSelected) {
      setFormData({
        ...formData,
        preferredStudyTimes: formData.preferredStudyTimes.filter(t => t !== time)
      })
    } else {
      setFormData({
        ...formData,
        preferredStudyTimes: [...formData.preferredStudyTimes, time]
      })
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <User className="w-6 h-6 text-purple-600" />
            <div>
              <h3 className="text-xl font-semibold">Edit Profile</h3>
              <p className="text-sm text-gray-600">@{user?.username}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Display Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display Name
            </label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              placeholder="How should others see your name?"
              className="input-field"
              maxLength={100}
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty to use your username
            </p>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell others about yourself, your goals, or what you're studying..."
              className="input-field"
              rows="3"
              maxLength={300}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.bio.length}/300 characters
            </p>
          </div>

          {/* Study Interests */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Study Interests
            </label>
            
            {/* Current Interests */}
            {formData.studyInterests.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.studyInterests.map((interest, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                  >
                    {interest}
                    <button
                      type="button"
                      onClick={() => removeInterest(interest)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Add New Interest */}
            <div className="flex space-x-2 mb-3">
              <input
                type="text"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
                placeholder="Add a study interest..."
                className="input-field flex-1"
                maxLength={50}
              />
              <button
                type="button"
                onClick={addInterest}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
              >
                Add
              </button>
            </div>

            {/* Popular Interests */}
            <div>
              <p className="text-xs text-gray-600 mb-2">Popular interests:</p>
              <div className="flex flex-wrap gap-1">
                {popularInterests
                  .filter(interest => !formData.studyInterests.includes(interest))
                  .slice(0, 12)
                  .map(interest => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => addPopularInterest(interest)}
                      className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded transition-colors"
                    >
                      + {interest}
                    </button>
                  ))}
              </div>
            </div>
          </div>

          {/* Preferred Study Times */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              Preferred Study Times
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {studyTimeOptions.map(time => (
                <button
                  key={time}
                  type="button"
                  onClick={() => toggleStudyTime(time)}
                  className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    formData.preferredStudyTimes.includes(time)
                      ? 'bg-green-100 text-green-800 border border-green-300'
                      : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Select when you're most productive. This helps match you with compatible study partners.
            </p>
          </div>

          {/* Timezone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Timezone
            </label>
            <select
              value={formData.timezone}
              onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
              className="input-field"
            >
              {Intl.supportedValuesOf('timeZone').map(tz => (
                <option key={tz} value={tz}>
                  {tz.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Privacy Setting */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {formData.isPublic ? (
                  <Globe className="w-5 h-5 text-green-600" />
                ) : (
                  <Lock className="w-5 h-5 text-gray-600" />
                )}
                <div>
                  <h4 className="font-medium text-gray-900">
                    {formData.isPublic ? 'Public Profile' : 'Private Profile'}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {formData.isPublic 
                      ? 'Others can discover and view your profile'
                      : 'Only friends can see your profile details'
                    }
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isPublic: !formData.isPublic })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.isPublic ? 'bg-green-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.isPublic ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
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
              disabled={loading}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Save Profile'}</span>
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
      </div>
    </div>
  )
}

export default UserProfileEditor