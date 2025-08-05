# Contributing to VJFocus2

Thank you for your interest in contributing to VJFocus2! This document provides guidelines and information for contributors.

## 🚀 Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/vjfocus2.git`
3. Install dependencies: `npm run setup`
4. Create a feature branch: `git checkout -b feature/your-feature-name`

## 🛠️ Development Setup

### Prerequisites
- Node.js (v16+)
- PostgreSQL
- Git

### Local Development
```bash
# Install all dependencies
npm run install:all

# Set up environment
npm run setup

# Start development servers
npm run dev
```

## 📝 Code Style Guidelines

### Frontend (React)
- Use functional components with hooks
- Follow the existing component structure
- Use Tailwind CSS for styling
- Add PropTypes for component props
- Keep components focused and reusable

### Backend (Node.js)
- Use ES6+ features
- Follow RESTful API conventions
- Add proper error handling
- Use async/await for asynchronous operations
- Add input validation for all endpoints

### Database
- Use parameterized queries to prevent SQL injection
- Add proper indexes for performance
- Follow the existing schema patterns
- Add migration scripts for schema changes

## 🧪 Testing

```bash
# Run frontend tests
cd frontend && npm test

# Run backend tests
cd backend && npm test

# Run all tests
npm test
```

## 📋 Pull Request Process

1. **Create a descriptive PR title**
   - ✅ Good: "Add task repetition AI feature"
   - ❌ Bad: "Update code"

2. **Fill out the PR template**
   - Describe what changes you made
   - Explain why the changes are needed
   - Add screenshots for UI changes

3. **Ensure all checks pass**
   - All tests must pass
   - Code must be properly formatted
   - No console errors or warnings

4. **Request review**
   - Tag relevant maintainers
   - Be responsive to feedback

## 🐛 Bug Reports

When reporting bugs, please include:

- **Environment**: OS, Node.js version, browser
- **Steps to reproduce**: Clear, numbered steps
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Screenshots**: If applicable
- **Console errors**: Any error messages

## 💡 Feature Requests

For new features, please:

1. Check if the feature already exists
2. Search existing issues and discussions
3. Create a detailed feature request with:
   - Clear description of the feature
   - Use cases and benefits
   - Possible implementation approach
   - Mockups or examples (if applicable)

## 🎯 Areas for Contribution

### High Priority
- [ ] Mobile responsiveness improvements
- [ ] Performance optimizations
- [ ] Accessibility enhancements
- [ ] Test coverage improvements

### Medium Priority
- [ ] Additional ambient sounds
- [ ] Export/import functionality
- [ ] Dark mode theme
- [ ] Keyboard shortcuts

### Low Priority
- [ ] Additional chart types
- [ ] Integration with external calendars
- [ ] Team collaboration features
- [ ] Mobile app development

## 📚 Resources

- [React Documentation](https://reactjs.org/docs)
- [Node.js Documentation](https://nodejs.org/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🤝 Community Guidelines

- Be respectful and inclusive
- Help others learn and grow
- Provide constructive feedback
- Follow the code of conduct
- Have fun building something amazing!

## 📞 Getting Help

- 💬 **Discussions**: Use GitHub Discussions for questions
- 🐛 **Issues**: Use GitHub Issues for bugs
- 📧 **Direct Contact**: your.email@example.com

Thank you for contributing to VJFocus2! 🎉