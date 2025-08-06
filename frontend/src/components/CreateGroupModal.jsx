import React, { useState } from 'react'
import { X, Users, Lock, Globe, Hash } from 'lucide-react'
import axios from 'axios'

const CreateGroupModal = ({ isOpen, onClose, onGroupCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    maxMembers: 10,
    isPrivate: false
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const categories = [
    'Computer Science',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'Engineering',
    'Business',
    'Languages',
    'Literature',
    'History',
    'Psychology',
    'Medicine',
    'Art & Design',
    'Music',
    'General Study',
    'Other'
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!formData.name.trim()) {
      setError('Group name is required')
      setLoading(false)
      return
    }

    try {
      const response = await axios.post('/social/groups', formData, {
        withCredentials: true
      })

      onGroupCreated(response.data)
      onClose()
      resetForm()
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create group')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      maxMembers: 10,
      isPrivate: false
    })
    setError('')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Users className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-semibold">Create Study Group</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Group Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Group Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Advanced React Study Group"
              className="input-field"
              maxLength={100}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.name.length}/100 characters
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What will your group study? What are your goals?"
              className="input-field"
              rows="3"
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.description.length}/500 characters
            </p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="input-field"
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Max Members */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maximum Members
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="3"
                max="50"
                value={formData.maxMembers}
                onChange={(e) => setFormData({ ...formData, maxMembers: parseInt(e.target.value) })}
                className="flex-1"
              />
              <span className="text-sm font-medium text-gray-700 w-8">
                {formData.maxMembers}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Recommended: 5-15 members for active discussions
            </p>
          </div>

          {/* Privacy Setting */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {formData.isPrivate ? (
                  <Lock className="w-5 h-5 text-gray-600" />
                ) : (
                  <Globe className="w-5 h-5 text-green-600" />
                )}
                <div>
                  <h4 className="font-medium text-gray-900">
                    {formData.isPrivate ? 'Private Group' : 'Public Group'}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {formData.isPrivate 
                      ? 'Only members can see group content and join by invite'
                      : 'Anyone can discover and join this group'
                    }
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isPrivate: !formData.isPrivate })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.isPrivate ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.isPrivate ? 'translate-x-6' : 'translate-x-1'
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
              disabled={loading || !formData.name.trim()}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Group'}
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

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <Hash className="w-4 h-4 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">After creating your group:</p>
              <ul className="text-xs space-y-1">
                <li>• You'll get a unique invite code to share</li>
                <li>• You can schedule study sessions and meetings</li>
                <li>• Members can share resources and collaborate</li>
                <li>• Track group productivity and achievements</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateGroupModal