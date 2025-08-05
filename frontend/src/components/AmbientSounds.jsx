import React, { useState, useRef, useEffect } from 'react'
import { Volume2, VolumeX, Play, Pause } from 'lucide-react'

const AmbientSounds = ({ isTimerActive }) => {
  const [selectedSound, setSelectedSound] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.5)
  const audioRef = useRef(null)

  const sounds = [
    {
      id: 'rain',
      name: 'Rain',
      emoji: '🌧️',
      url: 'https://www.soundjay.com/misc/sounds/rain-01.wav', // You'll need to replace with actual URLs
      description: 'Gentle rainfall'
    },
    {
      id: 'coffee',
      name: 'Coffee Shop',
      emoji: '☕',
      url: 'https://www.soundjay.com/misc/sounds/coffee-shop.wav',
      description: 'Café ambiance'
    },
    {
      id: 'forest',
      name: 'Forest',
      emoji: '🌲',
      url: 'https://www.soundjay.com/nature/sounds/forest-01.wav',
      description: 'Birds and nature'
    },
    {
      id: 'fan',
      name: 'White Noise',
      emoji: '🌪️',
      url: 'https://www.soundjay.com/misc/sounds/white-noise.wav',
      description: 'Fan/white noise'
    },
    {
      id: 'ocean',
      name: 'Ocean Waves',
      emoji: '🌊',
      url: 'https://www.soundjay.com/nature/sounds/ocean-01.wav',
      description: 'Calming waves'
    }
  ]

  // Sync with pomodoro timer
  useEffect(() => {
    if (isTimerActive && selectedSound && !isPlaying) {
      playSound()
    } else if (!isTimerActive && isPlaying) {
      pauseSound()
    }
  }, [isTimerActive])

  const playSound = () => {
    if (audioRef.current && selectedSound) {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const pauseSound = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  const selectSound = (sound) => {
    if (selectedSound?.id === sound.id) {
      // Deselect if clicking the same sound
      pauseSound()
      setSelectedSound(null)
      return
    }

    setSelectedSound(sound)
    
    // Create new audio element
    if (audioRef.current) {
      audioRef.current.pause()
    }
    
    // For demo purposes, we'll use a simple tone generator
    // In production, you'd use actual audio files
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    // Different frequencies for different "sounds"
    const frequencies = {
      rain: 200,
      coffee: 150,
      forest: 300,
      fan: 100,
      ocean: 80
    }
    
    oscillator.frequency.setValueAtTime(frequencies[sound.id] || 150, audioContext.currentTime)
    oscillator.type = 'sine'
    gainNode.gain.setValueAtTime(volume * 0.1, audioContext.currentTime) // Very low volume
    
    // Create a mock audio element for consistent interface
    audioRef.current = {
      play: () => {
        oscillator.start()
        setIsPlaying(true)
      },
      pause: () => {
        try {
          oscillator.stop()
        } catch (e) {
          // Oscillator already stopped
        }
        setIsPlaying(false)
      }
    }
  }

  const togglePlayPause = () => {
    if (isPlaying) {
      pauseSound()
    } else {
      playSound()
    }
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Volume2 className="w-6 h-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold">Ambient Sounds</h3>
            <p className="text-sm text-gray-600">Focus-enhancing background audio</p>
          </div>
        </div>
        {selectedSound && (
          <button
            onClick={togglePlayPause}
            className={`p-2 rounded-full transition-colors ${
              isPlaying 
                ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        {sounds.map((sound) => (
          <button
            key={sound.id}
            onClick={() => selectSound(sound)}
            className={`p-3 rounded-lg border transition-all ${
              selectedSound?.id === sound.id
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="text-2xl mb-1">{sound.emoji}</div>
            <div className="text-sm font-medium">{sound.name}</div>
            <div className="text-xs text-gray-500">{sound.description}</div>
          </button>
        ))}
      </div>

      {selectedSound && (
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <VolumeX className="w-4 h-4 text-gray-400" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="flex-1"
            />
            <Volume2 className="w-4 h-4 text-gray-400" />
          </div>
          
          <div className="text-xs text-gray-500 text-center">
            {isTimerActive ? '🎵 Synced with Pomodoro timer' : '⏸️ Will auto-play when timer starts'}
          </div>
        </div>
      )}

      <div className="mt-3 text-xs text-gray-400 text-center">
        💡 Tip: Sounds auto-start/stop with your Pomodoro sessions
      </div>
    </div>
  )
}

export default AmbientSounds