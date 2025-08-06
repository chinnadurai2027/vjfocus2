import React, { useState, useEffect } from 'react'
import { Users, UserPlus, Calendar, Video, Search, Plus, Settings, Hash } from 'lucide-react'
import axios from 'axios'
import CreateGroupModal from './CreateGroupModal'
import MeetingScheduler from './MeetingScheduler'
import UserProfileEditor from './UserProfileEditor'

const SocialDashboard = () => {
  const [activeTab, setActiveTab] = useState('friends')
  const [friends, setFriends] = useState([])
  const [groups, setGroups] = useState([])
  const [upcomingMeetings, setUpcomingMeetings] = useState([])
  const [searchResults, setSearchResults] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [showMeetingScheduler, setShowMeetingScheduler] = useState(false)
  const [showProfileEditor, setShowProfileEditor] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [joinGroupCode, setJoinGroupCode] = useState('')

  useEffect(() => {
    fetchSocialData()
  }, [])

  const fetchSocialData = async () => {
    try {
      const [friendsRes, groupsRes, meetingsRes] = await Promise.all([
        axios.get('/social/friends', { withCredentials: true }),
        axios.get('/social/groups', { withCredentials: true }),
        axios.get('/meetings/upcoming', { withCredentials: true })
      ])

      setFriends(friendsRes.data)
      setGroups(groupsRes.data)
      setUpcomingMeetings(meetingsRes.data)
    } catch (error) {
      console.error('Error fetching social data:', error)
    }
  }

  const searchUsers = async (query) => {
    if (query.length < 2) {
      setSearchResults([])
      return
    }

    setLoading(true)
    try {
      const response = await axios.get(`/social/users/search?q=${encodeURIComponent(query)}`, {
        withCredentials: true
      })
      setSearchResults(response.data)
    } catch (error) {
      console.error('Error searching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendFriendRequest = async (userId) => {
    try {
      await axios.post('/social/friends/request', { addresseeId: userId }, {
        withCredentials: true
      })
      
      // Update search results to show request sent
      setSearchResults(prev => prev.map(user => 
        user.id === userId ? { ...user, requestSent: true } : user
      ))
    } catch (error) {
      console.error('Error sending friend request:', error)
    }
  }

  const respondToFriendRequest = async (friendshipId, status) => {
    try {
      await axios.put('/social/friends/respond', { friendshipId, status }, {
        withCredentials: true
      })
      fetchSocialData() // Refresh data
    } catch (error) {
      console.error('Error responding to friend request:', error)
    }
  }

  const joinGroupByCode = async () => {
    if (!joinGroupCode.trim()) return

    try {
      await axios.post('/social/groups/join', { inviteCode: joinGroupCode.trim() }, {
        withCredentials: true
      })
      setJoinGroupCode('')
      fetchSocialData() // Refresh data
    } catch (error) {
      console.error('Error joining group:', error)
      alert(error.response?.data?.message || 'Failed to join group')
    }
  }

  const scheduleMeeting = (group) => {
    setSelectedGroup(group)
    setShowMeetingScheduler(true)
  }

  const tabs = [
    { id: 'friends', label: 'Friends', icon: Users },
    { id: 'groups', label: 'Study Groups', icon: Users },
    { id: 'meetings', label: 'Meetings', icon: Calendar },
    { id: 'discover', label: 'Discover', icon: Search }
  ]

  const renderFriendsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Your Study Network</h3>
        <span className="text-sm text-gray-600">
          {friends.filter(f => f.status === 'accepted').length} friends
        </span>
      </div>

      {/* Pending Requests */}
      {friends.filter(f => f.status === 'pending' && f.request_type === 'received').length > 0 && (
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-3">Pending Friend Requests</h4>
          <div className="space-y-3">
            {friends.filter(f => f.status === 'pending' && f.request_type === 'received').map(friend => (
              <div key={friend.friendship_id} className="flex items-center justify-between bg-white rounded p-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    {friend.display_name?.[0] || friend.username[0]}
                  </div>
                  <div>
                    <p className="font-medium">{friend.display_name || friend.username}</p>
                    <p className="text-sm text-gray-600">@{friend.username}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => respondToFriendRequest(friend.friendship_id, 'accepted')}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => respondToFriendRequest(friend.friendship_id, 'declined')}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-3 py-1 rounded text-sm"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friends List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {friends.filter(f => f.status === 'accepted').map(friend => (
          <div key={friend.id} className="card">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                {friend.display_name?.[0] || friend.username[0]}
              </div>
              <div className="flex-1">
                <h4 className="font-medium">{friend.display_name || friend.username}</h4>
                <p className="text-sm text-gray-600">@{friend.username}</p>
                {friend.productivity_score && (
                  <div className="flex items-center mt-1">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${Math.min(100, friend.productivity_score)}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 ml-2">{friend.productivity_score}% productive</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {friends.filter(f => f.status === 'accepted').length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>No friends yet. Start by discovering other users!</p>
        </div>
      )}
    </div>
  )

  const renderGroupsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Study Groups</h3>
        <div className="flex space-x-2">
          <button 
            onClick={() => setShowCreateGroup(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Group</span>
          </button>
        </div>
      </div>

      {/* Join Group by Code */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2 flex items-center">
          <Hash className="w-4 h-4 mr-2" />
          Join Group by Invite Code
        </h4>
        <div className="flex space-x-2">
          <input
            type="text"
            value={joinGroupCode}
            onChange={(e) => setJoinGroupCode(e.target.value.toUpperCase())}
            placeholder="Enter invite code..."
            className="input-field flex-1"
            maxLength={20}
          />
          <button
            onClick={joinGroupByCode}
            disabled={!joinGroupCode.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm"
          >
            Join
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {groups.map(group => (
          <div key={group.id} className="card">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-medium">{group.name}</h4>
                {group.category && (
                  <span className="text-xs text-gray-500">{group.category}</span>
                )}
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                group.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                group.role === 'moderator' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {group.role}
              </span>
            </div>
            {group.description && (
              <p className="text-sm text-gray-600 mb-3">{group.description}</p>
            )}
            <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
              <span>{group.member_count} members</span>
              <span>Joined {new Date(group.joined_at).toLocaleDateString()}</span>
            </div>
            {group.invite_code && (
              <div className="bg-gray-50 rounded p-2 mb-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Invite Code:</span>
                  <code className="text-sm font-mono bg-white px-2 py-1 rounded">
                    {group.invite_code}
                  </code>
                </div>
              </div>
            )}
            <div className="flex space-x-2">
              <button
                onClick={() => scheduleMeeting(group)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm flex items-center justify-center space-x-1"
              >
                <Calendar className="w-3 h-3" />
                <span>Schedule</span>
              </button>
              <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm">
                View
              </button>
            </div>
          </div>
        ))}
      </div>

      {groups.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>No study groups yet. Create or join one to get started!</p>
        </div>
      )}
    </div>
  )

  const renderMeetingsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Upcoming Meetings</h3>
        <span className="text-sm text-gray-600">{upcomingMeetings.length} scheduled</span>
      </div>

      <div className="space-y-4">
        {upcomingMeetings.map(meeting => (
          <div key={meeting.id} className="card">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-medium">{meeting.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{meeting.group_name}</p>
                {meeting.description && (
                  <p className="text-sm text-gray-500 mt-2">{meeting.description}</p>
                )}
                <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                  <span>📅 {new Date(meeting.scheduled_at).toLocaleDateString()}</span>
                  <span>🕒 {new Date(meeting.scheduled_at).toLocaleTimeString()}</span>
                  <span>⏱️ {meeting.duration_minutes} min</span>
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  meeting.attendance_status === 'accepted' ? 'bg-green-100 text-green-800' :
                  meeting.attendance_status === 'declined' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {meeting.attendance_status}
                </span>
                {meeting.meet_link && (
                  <a
                    href={meeting.meet_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                  >
                    <Video className="w-3 h-3" />
                    <span>Join</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {upcomingMeetings.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>No upcoming meetings. Schedule one with your study groups!</p>
        </div>
      )}
    </div>
  )

  const renderDiscoverTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Discover Study Partners</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              searchUsers(e.target.value)
            }}
            placeholder="Search by username or name..."
            className="input-field pl-10"
          />
        </div>
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {searchResults.map(user => (
          <div key={user.id} className="card">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  {user.display_name?.[0] || user.username[0]}
                </div>
                <div>
                  <h4 className="font-medium">{user.display_name || user.username}</h4>
                  <p className="text-sm text-gray-600">@{user.username}</p>
                  {user.study_interests && user.study_interests.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {user.study_interests.slice(0, 2).map((interest, index) => (
                        <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {interest}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => sendFriendRequest(user.id)}
                disabled={user.requestSent}
                className={`flex items-center space-x-1 px-3 py-1 rounded text-sm ${
                  user.requestSent 
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700 text-white'
                }`}
              >
                <UserPlus className="w-3 h-3" />
                <span>{user.requestSent ? 'Sent' : 'Add'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {searchQuery && searchResults.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          <Search className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>No users found matching "{searchQuery}"</p>
        </div>
      )}
    </div>
  )

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Social Hub</h2>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowProfileEditor(true)}
              className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span className="text-sm">Edit Profile</span>
            </button>
            <div className="text-sm text-gray-600">
              Connect • Collaborate • Achieve Together
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'friends' && renderFriendsTab()}
          {activeTab === 'groups' && renderGroupsTab()}
          {activeTab === 'meetings' && renderMeetingsTab()}
          {activeTab === 'discover' && renderDiscoverTab()}
        </div>
      </div>

      {/* Modals */}
      <CreateGroupModal
        isOpen={showCreateGroup}
        onClose={() => setShowCreateGroup(false)}
        onGroupCreated={(group) => {
          fetchSocialData()
          setShowCreateGroup(false)
        }}
      />

      <MeetingScheduler
        isOpen={showMeetingScheduler}
        onClose={() => setShowMeetingScheduler(false)}
        group={selectedGroup}
        onMeetingCreated={(meeting) => {
          fetchSocialData()
          setShowMeetingScheduler(false)
        }}
      />

      <UserProfileEditor
        isOpen={showProfileEditor}
        onClose={() => setShowProfileEditor(false)}
        onProfileUpdated={(profile) => {
          setShowProfileEditor(false)
        }}
      />
    </>
  )
}

export default SocialDashboard