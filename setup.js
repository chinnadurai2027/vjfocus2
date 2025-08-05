#!/usr/bin/env node

const { execSync } = require('child_process')
const { writeFileSync, existsSync } = require('fs')
const { randomBytes } = require('crypto')

console.log('🚀 Setting up VJFocus2...\n')

// Generate JWT secret
const jwtSecret = randomBytes(64).toString('hex')

// Create backend .env file
const backendEnv = `# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/vjfocus2

# JWT Secret (auto-generated)
JWT_SECRET=${jwtSecret}

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Server Port
PORT=3001`

if (!existsSync('backend/.env')) {
  writeFileSync('backend/.env', backendEnv)
  console.log('✅ Created backend/.env file')
} else {
  console.log('⚠️  backend/.env already exists, skipping...')
}

// Create frontend .env file
const frontendEnv = `# API URL for production deployment
# VITE_API_URL=https://your-backend-url.com`

if (!existsSync('frontend/.env')) {
  writeFileSync('frontend/.env', frontendEnv)
  console.log('✅ Created frontend/.env file')
} else {
  console.log('⚠️  frontend/.env already exists, skipping...')
}

console.log('\n📦 Installing dependencies...')

try {
  execSync('npm install', { stdio: 'inherit' })
  execSync('cd frontend && npm install', { stdio: 'inherit' })
  execSync('cd backend && npm install', { stdio: 'inherit' })
  console.log('✅ Dependencies installed successfully')
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message)
  process.exit(1)
}

console.log('\n🎉 Setup complete!')
console.log('\n📋 Next steps:')
console.log('1. Set up your PostgreSQL database')
console.log('2. Update DATABASE_URL in backend/.env')
console.log('3. Run: npm run dev')
console.log('\n📖 See README.md for detailed instructions')