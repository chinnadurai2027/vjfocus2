import React, { useState, useEffect } from 'react'
import { Bell, X, Check, UserPlus, Calendar, Users, MessageCircle } from 'lucide-react'
import axios from 'axios'

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    fetchNotifications()
    // Set up polling for new notifications
    const interval = setInterval(fetchNotifications, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchNotifications = async () => {
    try {
      // For now, we'll simulate notifications based on social data
      const [friendsRes, meetingsRes] = await Promise.all([
        axios.get('/social/friends', { withCredentials: true }),
        axios.get('/meetings/upcoming', { withCredentials: true })
      ])

      const mockNotifications = []

      // Friend request notifications
      const pendingRequests = friendsRes.data.filter(f => f.status === 'pending' && f.request_type === 'received')
      pendingRequests.forEach(friend => {
        mockNotifications.push({
          id: `friend_${friend.friendship_id}`,
          type: 'friend_request',
          title: 'New Friend Request',
          message: `${friend.display_name || friend.username} wants to be your study partner`,
          timestamp: new Date(friend.created_at),
          unread: true,
          actionData: { friendshipId: friend.friendship_id },
          icon: UserPlus,
          color: 'blue'
        })
      })

      // Upcoming meeting notifications
      const soonMeetings = meetingsRes.data.filter(meeting => {
        const meetingTime = new Date(meeting.scheduled_at)
        const now = new Date()
        const timeDiff = meetingTime - now
        return timeDiff > 0 && timeDiff <= 60 * 60 * 1000 // Within 1 hour
      })

      soonMeetings.forEach(meeting => {
        mockNotifications.push({
          id: `meeting_${meeting.id}`,
          type: 'meeting_reminder',
          title: 'Meeting Starting Soon',
          message: `"${meeting.title}" starts in ${Math.round((new Date(meeting.scheduled_at) - new Date()) / (1000 * 60))} minutes`,
          timestamp: new Date(),
          unread: true,
          actionData: { meetingId: meeting.id, meetLink: meeting.meet_link },
          icon: Calendar,
          color: 'green'
        })
      })

      // Sort by timestamp
      mockNotifications.sort((a, b) => b.timestamp - a.timestamp)

      setNotifications(mockNotifications)
      setUnreadCount(mockNotifications.filter(n => n.unread).length)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, unread: false } : n)
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })))
    setUnreadCount(0)
  }

  const handleNotificationAction = async (notification, action) => {
    try {
      if (notification.type === 'friend_request' && action === 'accept') {
        await axios.put('/social/friends/respond', {
          friendshipId: notification.actionData.friendshipId,
          status: 'accepted'
        }, { withCredentials: true })
        
        // Remove notification
        setNotifications(prev => prev.filter(n => n.id !== notification.id))
        setUnreadCount(prev => Math.max(0, prev - 1))
      } else if (notification.type === 'meeting_reminder' && action === 'join') {
        window.open(notification.actionData.meetLink, '_blank')
        markAsRead(notification.id)
      }
    } catch (error) {
      console.error('Error handling notification action:', error)
    }
  }

  const removeNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const formatTimeAgo = (timestamp) => {
    const now = new Date()
    const diff = now - timestamp
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Notifications</h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>No notifications yet</p>
                <p className="text-sm mt-1">We'll notify you about friend requests, meetings, and more!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => {
                  const Icon = notification.icon
                  return (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 transition-colors ${
                        notification.unread ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          notification.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                          notification.color === 'green' ? 'bg-green-100 text-green-600' :
                          notification.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900">
                              {notification.title}
                            </p>
                            <div className="flex items-center space-x-1">
                              {notification.unread && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                              <button
                                onClick={() => removeNotification(notification.id)}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatTimeAgo(notification.timestamp)}
                          </p>

                          {/* Action Buttons */}
                          {notification.type === 'friend_request' && (
                            <div className="flex space-x-2 mt-3">
                              <button
                                onClick={() => handleNotificationAction(notification, 'accept')}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => removeNotification(notification.id)}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded text-xs"
                              >
                                Decline
                              </button>
                            </div>
                          )}

                          {notification.type === 'meeting_reminder' && (
                            <div className="flex space-x-2 mt-3">
                              <button
                                onClick={() => handleNotificationAction(notification, 'join')}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs flex items-center space-x-1"
                              >
                                <Calendar className="w-3 h-3" />
                                <span>Join Meeting</span>
                              </button>
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded text-xs"
                              >
                                Dismiss
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 text-center">
              <button className="text-sm text-blue-600 hover:text-blue-700">
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationCenter