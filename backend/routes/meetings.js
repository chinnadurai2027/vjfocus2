import express from 'express'
import { query } from '../database/init.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// All routes require authentication
router.use(authenticateToken)

// Create a meeting
router.post('/', async (req, res) => {
  try {
    const { groupId, title, description, scheduledAt, durationMinutes } = req.body

    if (!groupId || !title || !scheduledAt) {
      return res.status(400).json({ message: 'Group ID, title, and scheduled time are required' })
    }

    // Verify user is a member of the group
    const memberCheck = await query(`
      SELECT role FROM group_members WHERE group_id = $1 AND user_id = $2
    `, [groupId, req.user.id])

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ message: 'You are not a member of this group' })
    }

    // Generate Google Meet link (in production, you'd integrate with Google Calendar API)
    const meetLink = `https://meet.google.com/${Math.random().toString(36).substring(2, 12)}-${Math.random().toString(36).substring(2, 12)}-${Math.random().toString(36).substring(2, 12)}`

    const result = await query(`
      INSERT INTO group_meetings (group_id, title, description, scheduled_at, duration_minutes, meet_link, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [groupId, title, description, scheduledAt, durationMinutes || 60, meetLink, req.user.id])

    const meeting = result.rows[0]

    // Auto-invite all group members
    const members = await query(`
      SELECT user_id FROM group_members WHERE group_id = $1
    `, [groupId])

    for (const member of members.rows) {
      await query(`
        INSERT INTO meeting_attendees (meeting_id, user_id, status)
        VALUES ($1, $2, $3)
      `, [meeting.id, member.user_id, member.user_id === req.user.id ? 'accepted' : 'invited'])
    }

    res.status(201).json(meeting)
  } catch (error) {
    console.error('Create meeting error:', error)
    res.status(500).json({ message: 'Failed to create meeting' })
  }
})

// Get meetings for a group
router.get('/group/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params

    // Verify user is a member of the group
    const memberCheck = await query(`
      SELECT role FROM group_members WHERE group_id = $1 AND user_id = $2
    `, [groupId, req.user.id])

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ message: 'You are not a member of this group' })
    }

    const result = await query(`
      SELECT m.*, u.username as created_by_username, p.display_name as created_by_name,
             COUNT(ma.id) as total_attendees,
             COUNT(CASE WHEN ma.status = 'accepted' THEN 1 END) as accepted_attendees
      FROM group_meetings m
      JOIN users u ON m.created_by = u.id
      LEFT JOIN user_profiles p ON u.id = p.user_id
      LEFT JOIN meeting_attendees ma ON m.id = ma.meeting_id
      WHERE m.group_id = $1
      GROUP BY m.id, u.username, p.display_name
      ORDER BY m.scheduled_at ASC
    `, [groupId])

    res.json(result.rows)
  } catch (error) {
    console.error('Get group meetings error:', error)
    res.status(500).json({ message: 'Failed to fetch meetings' })
  }
})

// Get user's upcoming meetings
router.get('/upcoming', async (req, res) => {
  try {
    const result = await query(`
      SELECT m.*, g.name as group_name, ma.status as attendance_status,
             u.username as created_by_username, p.display_name as created_by_name
      FROM group_meetings m
      JOIN meeting_attendees ma ON m.id = ma.meeting_id
      JOIN study_groups g ON m.group_id = g.id
      JOIN users u ON m.created_by = u.id
      LEFT JOIN user_profiles p ON u.id = p.user_id
      WHERE ma.user_id = $1 AND m.scheduled_at > NOW() AND m.status != 'cancelled'
      ORDER BY m.scheduled_at ASC
      LIMIT 10
    `, [req.user.id])

    res.json(result.rows)
  } catch (error) {
    console.error('Get upcoming meetings error:', error)
    res.status(500).json({ message: 'Failed to fetch upcoming meetings' })
  }
})

// Respond to meeting invitation
router.put('/:meetingId/respond', async (req, res) => {
  try {
    const { meetingId } = req.params
    const { status } = req.body

    if (!['accepted', 'declined'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' })
    }

    const result = await query(`
      UPDATE meeting_attendees 
      SET status = $1
      WHERE meeting_id = $2 AND user_id = $3
      RETURNING *
    `, [status, meetingId, req.user.id])

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Meeting invitation not found' })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error('Respond to meeting error:', error)
    res.status(500).json({ message: 'Failed to respond to meeting' })
  }
})

// Join meeting (mark as attended)
router.post('/:meetingId/join', async (req, res) => {
  try {
    const { meetingId } = req.params

    // Update attendance status and join time
    const result = await query(`
      UPDATE meeting_attendees 
      SET status = 'attended', joined_at = CURRENT_TIMESTAMP
      WHERE meeting_id = $1 AND user_id = $2
      RETURNING *
    `, [meetingId, req.user.id])

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Meeting not found or not invited' })
    }

    // Get meeting details
    const meetingResult = await query(`
      SELECT * FROM group_meetings WHERE id = $1
    `, [meetingId])

    res.json({
      attendance: result.rows[0],
      meeting: meetingResult.rows[0]
    })
  } catch (error) {
    console.error('Join meeting error:', error)
    res.status(500).json({ message: 'Failed to join meeting' })
  }
})

// Leave meeting
router.post('/:meetingId/leave', async (req, res) => {
  try {
    const { meetingId } = req.params

    const result = await query(`
      UPDATE meeting_attendees 
      SET left_at = CURRENT_TIMESTAMP
      WHERE meeting_id = $1 AND user_id = $2 AND joined_at IS NOT NULL
      RETURNING *
    `, [meetingId, req.user.id])

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Meeting not found or not joined' })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error('Leave meeting error:', error)
    res.status(500).json({ message: 'Failed to leave meeting' })
  }
})

// Get meeting attendees
router.get('/:meetingId/attendees', async (req, res) => {
  try {
    const { meetingId } = req.params

    // Verify user has access to this meeting
    const accessCheck = await query(`
      SELECT ma.* FROM meeting_attendees ma
      WHERE ma.meeting_id = $1 AND ma.user_id = $2
    `, [meetingId, req.user.id])

    if (accessCheck.rows.length === 0) {
      return res.status(403).json({ message: 'Access denied' })
    }

    const result = await query(`
      SELECT ma.*, u.username, p.display_name, p.avatar_url
      FROM meeting_attendees ma
      JOIN users u ON ma.user_id = u.id
      LEFT JOIN user_profiles p ON u.id = p.user_id
      WHERE ma.meeting_id = $1
      ORDER BY ma.status, u.username
    `, [meetingId])

    res.json(result.rows)
  } catch (error) {
    console.error('Get meeting attendees error:', error)
    res.status(500).json({ message: 'Failed to fetch attendees' })
  }
})

// Update meeting status (for meeting creators/admins)
router.put('/:meetingId/status', async (req, res) => {
  try {
    const { meetingId } = req.params
    const { status } = req.body

    if (!['scheduled', 'ongoing', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' })
    }

    // Verify user can update this meeting
    const meetingCheck = await query(`
      SELECT m.*, gm.role FROM group_meetings m
      JOIN group_members gm ON m.group_id = gm.group_id
      WHERE m.id = $1 AND gm.user_id = $2 AND (m.created_by = $2 OR gm.role IN ('admin', 'moderator'))
    `, [meetingId, req.user.id])

    if (meetingCheck.rows.length === 0) {
      return res.status(403).json({ message: 'Permission denied' })
    }

    const result = await query(`
      UPDATE group_meetings 
      SET status = $1
      WHERE id = $2
      RETURNING *
    `, [status, meetingId])

    res.json(result.rows[0])
  } catch (error) {
    console.error('Update meeting status error:', error)
    res.status(500).json({ message: 'Failed to update meeting status' })
  }
})

export default router