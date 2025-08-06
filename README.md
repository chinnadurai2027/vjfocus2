# 🎯 VJFocus2 - Advanced Productivity & Focus Management System

A revolutionary productivity web app that combines task management, pomodoro technique, AI-powered insights, and self-reflection tools. Built with React, Node.js, Express, and PostgreSQL - completely free and self-hosted.

## 🌟 **Unique Features That Set VJFocus2 Apart**

### 🧠 **AI-Powered Productivity Intelligence**
- **Focus Prediction AI**: Analyzes your patterns to predict peak productivity hours
- **Task Repetition AI**: Detects weekly patterns and suggests recurring tasks
- **Study Personality Report**: 7-day analysis revealing your unique productivity profile

### 🧘 **Self-Awareness & Reflection Tools**
- **Distraction Journal**: Post-session reflection to build self-awareness
- **Mind Dump Pad**: Clear mental clutter before focus sessions
- **Weekly Task Capsule**: Comprehensive weekly productivity summaries

### 🎧 **Focus Enhancement**
- **Ambient Sound Workspace**: 5 focus-enhancing soundscapes that sync with your timer
- **Deadline Pressure Visualizer**: Color-coded urgency with animated pressure indicators
- **Smart Pomodoro Timer**: Customizable intervals with intelligent session tracking

### 📊 **Advanced Analytics**
- **Productivity Stats**: Visual charts and comprehensive analytics
- **Pattern Recognition**: Understand your work habits and optimize accordingly
- **Consistency Tracking**: Monitor and improve your daily productivity rhythm

## ✨ **Core Features**

### 📋 **Task Management**
- Create, edit, delete, and organize tasks with priorities and due dates
- Smart task suggestions based on your patterns
- Deadline pressure visualization with urgency indicators
- Task completion tracking and analytics

### ⏰ **Pomodoro Timer**
- Customizable work/break intervals with browser notifications
- Automatic session logging and analytics
- Integration with ambient sounds and distraction tracking
- Session completion insights and patterns

### 🔐 **Security & Privacy**
- Secure JWT-based authentication with HTTP-only cookies
- All data stored in your own PostgreSQL database
- No external services or data sharing
- Complete privacy and control over your productivity data

## 🛠️ **Tech Stack**

### **Frontend**
- **React 18** with Vite for lightning-fast development
- **Tailwind CSS** for responsive, modern UI design
- **Chart.js** for beautiful data visualizations
- **Lucide React** for consistent iconography
- **Date-fns** for robust date handling

### **Backend**
- **Node.js + Express** for robust API server
- **JWT Authentication** with HTTP-only cookies
- **bcrypt.js** for secure password hashing
- **PostgreSQL** for reliable data storage
- **CORS protection** and input validation

### **Deployment**
- **Frontend**: GitHub Pages, Vercel, or Netlify
- **Backend**: Render, Railway, or any Node.js hosting
- **Database**: PostgreSQL (Render, Railway, or self-hosted)

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js (v16 or higher)
- PostgreSQL database
- Git

### **One-Command Setup**
```bash
git clone https://github.com/chinnadurai2027/vjfocus2.git
cd vjfocus2
npm run setup
```

### **Manual Setup**

1. **Clone and Install**
   ```bash
   git clone https://github.com/chinnadurai2027/vjfocus2.git
   cd vjfocus2
   npm run install:all
   ```

2. **Database Setup**
   ```bash
   # Create PostgreSQL database
   createdb vjfocus2
   
   # Or use our Docker setup
   docker-compose up -d
   ```

3. **Environment Configuration**
   ```bash
   # Backend configuration
   cd backend
   cp .env.example .env
   # Edit .env with your database credentials
   
   # Frontend configuration (for production)
   cd ../frontend
   cp .env.example .env
   # Set VITE_API_URL for production deployment
   ```

4. **Start Development**
   ```bash
   npm run dev
   ```
   
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3001

### **Environment Variables**
```env
# Backend (.env)
DATABASE_URL=postgresql://username:password@localhost:5432/vjfocus2
JWT_SECRET=your-super-secure-jwt-secret-key-here
FRONTEND_URL=http://localhost:5173
PORT=3001

# Frontend (.env) - Optional for production
VITE_API_URL=https://your-backend-url.com
```

## 📦 Deployment

### Frontend (GitHub Pages)

1. **Build the frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to GitHub Pages**
   - Push your code to GitHub
   - Go to repository Settings > Pages
   - Select source: GitHub Actions
   - The build will deploy automatically

### Backend (Render/Railway)

1. **Create account on Render or Railway**

2. **Connect your GitHub repository**

3. **Set environment variables**:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `JWT_SECRET`: A secure random string
   - `FRONTEND_URL`: Your deployed frontend URL
   - `NODE_ENV`: production

4. **Deploy**: The service will automatically deploy from your repository

### Database (Free PostgreSQL)

**Option 1: Render PostgreSQL (Free)**
- Create a PostgreSQL database on Render
- Copy the connection string to your backend environment

**Option 2: Railway PostgreSQL (Free)**
- Add PostgreSQL service to your Railway project
- Copy the connection string to your backend environment

## 🔧 Configuration

### Frontend Configuration

Update `frontend/vite.config.js` for production:

```javascript
export default defineConfig({
  plugins: [react()],
  base: '/vjfocus2/', // Your GitHub Pages path
  server: {
    proxy: {
      '/api': {
        target: 'https://your-backend-url.com',
        changeOrigin: true
      }
    }
  }
})
```

### Backend Configuration

The backend automatically handles:
- Database table creation
- CORS configuration
- JWT token management
- Secure cookie handling

## 📱 Usage

1. **Register/Login**: Create an account or sign in
2. **Manage Tasks**: Add tasks with priorities and due dates
3. **Use Pomodoro Timer**: Start focused work sessions
4. **View Stats**: Track your productivity over time

## 🔒 Security Features

- Passwords hashed with bcrypt (12 rounds)
- JWT tokens stored in HTTP-only cookies
- CORS protection
- SQL injection prevention
- Input validation and sanitization

## 🎨 Customization

### Colors and Styling

Edit `frontend/tailwind.config.js` to customize the theme:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        50: '#eff6ff',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
      }
    }
  }
}
```

### Pomodoro Settings

Default timer settings can be modified in `PomodoroTimer.jsx`:

```javascript
const [settings, setSettings] = useState({
  workTime: 25,      // minutes
  shortBreak: 5,     // minutes
  longBreak: 15,     // minutes
  sessionsUntilLongBreak: 4
})
```

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify PostgreSQL is running
   - Check DATABASE_URL format
   - Ensure database exists

2. **CORS Errors**
   - Update FRONTEND_URL in backend .env
   - Check Vite proxy configuration

3. **Authentication Issues**
   - Verify JWT_SECRET is set
   - Clear browser cookies
   - Check cookie settings for production

### Development Tips

- Use `npm run dev` for hot reloading
- Check browser console for frontend errors
- Check terminal for backend errors
- Use PostgreSQL logs for database issues

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

If you encounter any issues or have questions:

1. Check the troubleshooting section
2. Search existing GitHub issues
3. Create a new issue with detailed information

## 📸 **Screenshots**

*Coming soon - Add screenshots of your app in action!*

## 🎯 **Detailed Feature Breakdown**

### 🧠 **AI-Powered Features**
| Feature | Description | Benefit |
|---------|-------------|---------|
| **Focus Prediction AI** | Analyzes your productivity patterns to predict peak focus times | Schedule important tasks when you're naturally most productive |
| **Task Repetition AI** | Detects weekly patterns and suggests recurring tasks | Never forget routine tasks, build consistent habits |
| **Study Personality Report** | 7-day analysis revealing your unique productivity profile | Understand your work style and optimize accordingly |

### 🧘 **Self-Awareness Tools**
| Feature | Description | Benefit |
|---------|-------------|---------|
| **Distraction Journal** | Post-session reflection on what distracted you | Build self-awareness and reduce distractions over time |
| **Mind Dump Pad** | Clear mental clutter before focus sessions | Start each session with a clear, focused mind |
| **Weekly Task Capsule** | Comprehensive weekly productivity summaries | Track progress and reflect on achievements |

### 🎧 **Focus Enhancement**
| Feature | Description | Benefit |
|---------|-------------|---------|
| **Ambient Sounds** | 5 focus-enhancing soundscapes (Rain, Coffee Shop, Forest, etc.) | Create the perfect environment for concentration |
| **Deadline Visualizer** | Color-coded urgency with animated pressure indicators | Never miss deadlines, prioritize effectively |
| **Smart Pomodoro** | Customizable intervals with intelligent session tracking | Maintain focus and track productivity patterns |

## 🏗️ **Architecture**

```
vjfocus2/
├── frontend/          # React + Vite application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts (Auth, etc.)
│   │   └── main.jsx       # App entry point
│   ├── public/            # Static assets
│   └── package.json       # Frontend dependencies
├── backend/           # Node.js + Express API
│   ├── routes/            # API routes
│   ├── middleware/        # Auth middleware
│   ├── database/          # Database setup and queries
│   └── server.js          # Server entry point
├── .github/           # GitHub Actions workflows
└── docs/              # Documentation
```

## 🤝 **Contributing**

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### **Development Guidelines**
- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- Built with ❤️ for productivity enthusiasts
- Inspired by the Pomodoro Technique by Francesco Cirillo
- Thanks to the open-source community for amazing tools

## 📞 **Support & Community**

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/chinnadurai2027/vjfocus2/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/chinnadurai2027/vjfocus2/discussions)
- 📧 **Contact**: your.email@example.com

---

**VJFocus2** - Where productivity meets self-awareness! 🎯✨

*Built with React, Node.js, and a passion for helping people achieve their goals.*