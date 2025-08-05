import express from 'express'
import { query } from '../database/init.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// All routes require authentication
router.use(authenticateToken)

// Get all tasks for the authenticated user
router.get('/', async (req, res) => {
  try {
    const result = await query(
      `SELECT id, title, description, priority, completed, due_date, created_at, updated_at, completed_at
       FROM tasks 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [req.user.id]
    )

    res.json(result.rows)
  } catch (error) {
    console.error('Get tasks error:', error)
    res.status(500).json({ message: 'Failed to fetch tasks' })
  }
})

// Create a new task
router.post('/', async (req, res) => {
  try {
    const { title, description, priority = 'medium', dueDate } = req.body

    if (!title) {
      return res.status(400).json({ message: 'Title is required' })
    }

    if (!['low', 'medium', 'high'].includes(priority)) {
      return res.status(400).json({ message: 'Invalid priority level' })
    }

    const result = await query(
      `INSERT INTO tasks (user_id, title, description, priority, due_date)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, title, description, priority, completed, due_date, created_at, updated_at`,
      [req.user.id, title, description || null, priority, dueDate || null]
    )

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Create task error:', error)
    res.status(500).json({ message: 'Failed to create task' })
  }
})

// Update a task
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { title, description, priority, dueDate } = req.body

    if (!title) {
      return res.status(400).json({ message: 'Title is required' })
    }

    if (!['low', 'medium', 'high'].includes(priority)) {
      return res.status(400).json({ message: 'Invalid priority level' })
    }

    const result = await query(
      `UPDATE tasks 
       SET title = $1, description = $2, priority = $3, due_date = $4, updated_at = CURRENT_TIMESTAMP
       WHERE id = $5 AND user_id = $6
       RETURNING id, title, description, priority, completed, due_date, created_at, updated_at, completed_at`,
      [title, description || null, priority, dueDate || null, id, req.user.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error('Update task error:', error)
    res.status(500).json({ message: 'Failed to update task' })
  }
})

// Update task completion status
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { completed } = req.body

    if (typeof completed !== 'boolean') {
      return res.status(400).json({ message: 'Completed must be a boolean value' })
    }

    const completedAt = completed ? 'CURRENT_TIMESTAMP' : 'NULL'
    
    const result = await query(
      `UPDATE tasks 
       SET completed = $1, completed_at = ${completedAt}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND user_id = $3
       RETURNING id, title, description, priority, completed, due_date, created_at, updated_at, completed_at`,
      [completed, id, req.user.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error('Update task completion error:', error)
    res.status(500).json({ message: 'Failed to update task completion' })
  }
})

// Delete a task
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const result = await query(
      'DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' })
    }

    res.json({ message: 'Task deleted successfully' })
  } catch (error) {
    console.error('Delete task error:', error)
    res.status(500).json({ message: 'Failed to delete task' })
  }
})

// Record a pomodoro session
router.post('/pomodoro-session', async (req, res) => {
  try {
    const { sessionType, duration } = req.body

    if (!['work', 'shortBreak', 'longBreak'].includes(sessionType)) {
      return res.status(400).json({ message: 'Invalid session type' })
    }

    if (!duration || duration <= 0) {
      return res.status(400).json({ message: 'Duration must be a positive number' })
    }

    const result = await query(
      `INSERT INTO pomodoro_sessions (user_id, session_type, duration)
       VALUES ($1, $2, $3)
       RETURNING id, session_type, duration, completed_at`,
      [req.user.id, sessionType, duration]
    )

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Record pomodoro session error:', error)
    res.status(500).json({ message: 'Failed to record pomodoro session' })
  }
})

// Get pomodoro sessions for stats
router.get('/pomodoro-sessions', async (req, res) => {
  try {
    const result = await query(
      `SELECT id, session_type as type, duration, completed_at as "completedAt"
       FROM pomodoro_sessions 
       WHERE user_id = $1 
       ORDER BY completed_at DESC
       LIMIT 100`,
      [req.user.id]
    )

    res.json(result.rows)
  } catch (error) {
    console.error('Get pomodoro sessions error:', error)
    res.status(500).json({ message: 'Failed to fetch pomodoro sessions' })
  }
})

// Record a distraction
router.post('/distraction', async (req, res) => {
  try {
    const { sessionId, type, notes } = req.body

    if (!sessionId || !type) {
      return res.status(400).json({ message: 'Session ID and distraction type are required' })
    }

    // Verify the session belongs to the user
    const sessionCheck = await query(
      'SELECT id FROM pomodoro_sessions WHERE id = $1 AND user_id = $2',
      [sessionId, req.user.id]
    )

    if (sessionCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Session not found' })
    }

    const result = await query(
      `INSERT INTO distractions (user_id, session_id, distraction_type, notes)
       VALUES ($1, $2, $3, $4)
       RETURNING id, distraction_type, notes, created_at`,
      [req.user.id, sessionId, type, notes || null]
    )

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Record distraction error:', error)
    res.status(500).json({ message: 'Failed to record distraction' })
  }
})

// Get distraction analytics
router.get('/distractions', async (req, res) => {
  try {
    const result = await query(
      `SELECT distraction_type, notes, created_at, 
              COUNT(*) OVER (PARTITION BY distraction_type) as frequency
       FROM distractions 
       WHERE user_id = $1 
       ORDER BY created_at DESC
       LIMIT 50`,
      [req.user.id]
    )

    res.json(result.rows)
  } catch (error) {
    console.error('Get distractions error:', error)
    res.status(500).json({ message: 'Failed to fetch distractions' })
  }
})

export default router