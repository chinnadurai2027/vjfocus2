import express from 'express'
import { query } from '../database/init.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// All routes require authentication
router.use(authenticateToken)

// ===== USER PROFILE ROUTES =====

// Get user profile
router.get('/profile/:userId?', async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id
    
    const result = await query(`
      SELECT u.id, u.username, p.display_name, p.bio, p.avatar_url, 
             p.study_interests, p.timezone, p.preferred_study_times, 
             p.productivity_score, p.is_public, p.created_at
      FROM users u
      LEFT JOIN user_profiles p ON u.id = p.user_id
      WHERE u.id = $1
    `, [userId])

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' })
    }

    const profile = result.rows[0]
    
    // If viewing someone else's profile, check if it's public or if they're friends
    if (userId != req.user.id) {
      if (!profile.is_public) {
        const friendshipCheck = await query(`
          SELECT status FROM friendships 
          WHERE ((requester_id = $1 AND addressee_id = $2) OR 
                 (requester_id = $2 AND addressee_id = $1)) 
          AND status = 'accepted'
        `, [req.user.id, userId])

        if (friendshipCheck.rows.length === 0) {
          return res.status(403).json({ message: 'Profile is private' })
        }
      }
    }

    res.json(profile)
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({ message: 'Failed to fetch profile' })
  }
})

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const { displayName, bio, studyInterests, timezone, preferredStudyTimes, isPublic } = req.body

    // Upsert profile
    const result = await query(`
      INSERT INTO user_profiles (user_id, display_name, bio, study_interests, timezone, preferred_study_times, is_public, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        display_name = $2, bio = $3, study_interests = $4, 
        timezone = $5, preferred_study_times = $6, is_public = $7, 
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [req.user.id, displayName, bio, studyInterests, timezone, preferredStudyTimes, isPublic])

    res.json(result.rows[0])
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({ message: 'Failed to update profile' })
  }
})

// ===== FRIEND SYSTEM ROUTES =====

// Send friend request
router.post('/friends/request', async (req, res) => {
  try {
    const { addresseeId } = req.body

    if (addresseeId == req.user.id) {
      return res.status(400).json({ message: 'Cannot send friend request to yourself' })
    }

    // Check if friendship already exists
    const existingFriendship = await query(`
      SELECT * FROM friendships 
      WHERE (requester_id = $1 AND addressee_id = $2) OR 
            (requester_id = $2 AND addressee_id = $1)
    `, [req.user.id, addresseeId])

    if (existingFriendship.rows.length > 0) {
      return res.status(400).json({ message: 'Friendship request already exists' })
    }

    const result = await query(`
      INSERT INTO friendships (requester_id, addressee_id, status)
      VALUES ($1, $2, 'pending')
      RETURNING *
    `, [req.user.id, addresseeId])

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Send friend request error:', error)
    res.status(500).json({ message: 'Failed to send friend request' })
  }
})

// Respond to friend request
router.put('/friends/respond', async (req, res) => {
  try {
    const { friendshipId, status } = req.body

    if (!['accepted', 'declined'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' })
    }

    const result = await query(`
      UPDATE friendships 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND addressee_id = $3 AND status = 'pending'
      RETURNING *
    `, [status, friendshipId, req.user.id])

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Friend request not found' })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error('Respond to friend request error:', error)
    res.status(500).json({ message: 'Failed to respond to friend request' })
  }
})

// Get friends list
router.get('/friends', async (req, res) => {
  try {
    const result = await query(`
      SELECT f.id as friendship_id, f.status, f.created_at,
             u.id, u.username, p.display_name, p.avatar_url, p.productivity_score,
             CASE 
               WHEN f.requester_id = $1 THEN 'sent'
               ELSE 'received'
             END as request_type
      FROM friendships f
      JOIN users u ON (CASE WHEN f.requester_id = $1 THEN f.addressee_id ELSE f.requester_id END = u.id)
      LEFT JOIN user_profiles p ON u.id = p.user_id
      WHERE (f.requester_id = $1 OR f.addressee_id = $1)
      ORDER BY f.created_at DESC
    `, [req.user.id])

    res.json(result.rows)
  } catch (error) {
    console.error('Get friends error:', error)
    res.status(500).json({ message: 'Failed to fetch friends' })
  }
})

// Search users
router.get('/users/search', async (req, res) => {
  try {
    const { q } = req.query
    
    if (!q || q.length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' })
    }

    const result = await query(`
      SELECT u.id, u.username, p.display_name, p.avatar_url, p.study_interests, p.productivity_score
      FROM users u
      LEFT JOIN user_profiles p ON u.id = p.user_id
      WHERE (u.username ILIKE $1 OR p.display_name ILIKE $1) 
        AND u.id != $2 
        AND (p.is_public = true OR p.is_public IS NULL)
      LIMIT 20
    `, [`%${q}%`, req.user.id])

    res.json(result.rows)
  } catch (error) {
    console.error('Search users error:', error)
    res.status(500).json({ message: 'Failed to search users' })
  }
})

// ===== STUDY GROUPS ROUTES =====

// Create study group
router.post('/groups', async (req, res) => {
  try {
    const { name, description, category, maxMembers, isPrivate } = req.body

    if (!name || name.length < 3) {
      return res.status(400).json({ message: 'Group name must be at least 3 characters' })
    }

    // Generate invite code
    const inviteCode = Math.random().toString(36).substring(2, 12).toUpperCase()

    const result = await query(`
      INSERT INTO study_groups (name, description, creator_id, category, max_members, is_private, invite_code)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [name, description, req.user.id, category, maxMembers || 10, isPrivate || false, inviteCode])

    const groupId = result.rows[0].id

    // Add creator as admin
    await query(`
      INSERT INTO group_members (group_id, user_id, role)
      VALUES ($1, $2, 'admin')
    `, [groupId, req.user.id])

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Create group error:', error)
    res.status(500).json({ message: 'Failed to create group' })
  }
})

// Get user's groups
router.get('/groups', async (req, res) => {
  try {
    const result = await query(`
      SELECT g.*, gm.role, gm.joined_at,
             COUNT(gm2.id) as member_count
      FROM study_groups g
      JOIN group_members gm ON g.id = gm.group_id
      LEFT JOIN group_members gm2 ON g.id = gm2.group_id
      WHERE gm.user_id = $1
      GROUP BY g.id, gm.role, gm.joined_at
      ORDER BY gm.joined_at DESC
    `, [req.user.id])

    res.json(result.rows)
  } catch (error) {
    console.error('Get groups error:', error)
    res.status(500).json({ message: 'Failed to fetch groups' })
  }
})

// Join group by invite code
router.post('/groups/join', async (req, res) => {
  try {
    const { inviteCode } = req.body

    // Find group by invite code
    const groupResult = await query(`
      SELECT * FROM study_groups WHERE invite_code = $1
    `, [inviteCode])

    if (groupResult.rows.length === 0) {
      return res.status(404).json({ message: 'Invalid invite code' })
    }

    const group = groupResult.rows[0]

    // Check if already a member
    const memberCheck = await query(`
      SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2
    `, [group.id, req.user.id])

    if (memberCheck.rows.length > 0) {
      return res.status(400).json({ message: 'Already a member of this group' })
    }

    // Check member limit
    const memberCount = await query(`
      SELECT COUNT(*) as count FROM group_members WHERE group_id = $1
    `, [group.id])

    if (parseInt(memberCount.rows[0].count) >= group.max_members) {
      return res.status(400).json({ message: 'Group is full' })
    }

    // Add member
    await query(`
      INSERT INTO group_members (group_id, user_id, role)
      VALUES ($1, $2, 'member')
    `, [group.id, req.user.id])

    res.json({ message: 'Successfully joined group', group })
  } catch (error) {
    console.error('Join group error:', error)
    res.status(500).json({ message: 'Failed to join group' })
  }
})

export default router