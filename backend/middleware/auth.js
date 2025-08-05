import jwt from 'jsonwebtoken'
import { query } from '../database/init.js'

export const authenticateToken = async (req, res, next) => {
  try {
    const token = req.cookies.token

    if (!token) {
      return res.status(401).json({ message: 'Access token required' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    // Verify user still exists
    const result = await query('SELECT id, username FROM users WHERE id = $1', [decoded.userId])
    
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'User not found' })
    }

    req.user = result.rows[0]
    next()
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' })
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' })
    }
    
    console.error('Auth middleware error:', error)
    res.status(500).json({ message: 'Authentication error' })
  }
}