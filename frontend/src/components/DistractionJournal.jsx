import React, { useState } from 'react'
import { X, Brain, TrendingDown } from 'lucide-react'

const DistractionJournal = ({ isOpen, onClose, onSubmit }) => {
  const [selectedDistraction, setSelectedDistraction] = useState('')
  const [customDistraction, setCustomDistraction] = useState('')
  const [notes, setNotes] = useState('')

  const commonDistractions = [
    { id: 'social_media', label: 'Social Media', emoji: '📱' },
    { id: 'youtube', label: 'YouTube/Videos', emoji: '📺' },
    { id: 'messaging', label: 'WhatsApp/Messages', emoji: '💬' },
    { id: 'email', label: 'Email', emoji: '📧' },
    { id: 'noise', label: 'External Noise', emoji: '🔊' },
    { id: 'hunger', label: 'Hunger/Thirst', emoji: '🍕' },
    { id: 'fatigue', label: 'Tiredness', emoji: '😴' },
    { id: 'thoughts', label: 'Random Thoughts', emoji: '💭' },
    { id: 'other', label: 'Other', emoji: '❓' }
  ]

  const handleSubmit = () => {
    const distraction = selectedDistraction === 'other' ? customDistraction : selectedDistraction
    if (distraction) {
      onSubmit({
        type: distraction,
        notes: notes,
        timestamp: new Date().toISOString()
      })
      // Reset form
      setSelectedDistraction('')
      setCustomDistraction('')
      setNotes('')
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Brain className="w-6 h-6 text-purple-600" />
            <h3 className="text-lg font-semibold">Distraction Check-in</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-gray-600 mb-4">
          What distracted you during this session? (This helps build self-awareness)
        </p>

        <div className="space-y-3 mb-4">
          {commonDistractions.map((distraction) => (
            <button
              key={distraction.id}
              onClick={() => setSelectedDistraction(distraction.id)}
              className={`w-full flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                selectedDistraction === distraction.id
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="text-xl">{distraction.emoji}</span>
              <span className="text-left">{distraction.label}</span>
            </button>
          ))}
        </div>

        {selectedDistraction === 'other' && (
          <div className="mb-4">
            <input
              type="text"
              value={customDistraction}
              onChange={(e) => setCustomDistraction(e.target.value)}
              placeholder="What distracted you?"
              className="input-field"
            />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any thoughts on why this happened or how to avoid it?"
            className="input-field"
            rows="3"
          />
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleSubmit}
            disabled={!selectedDistraction || (selectedDistraction === 'other' && !customDistraction)}
            className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Reflection
          </button>
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  )
}

export default DistractionJournal