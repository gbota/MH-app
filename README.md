# Music School Management System

A comprehensive web application for managing a music school, including lesson scheduling, payment tracking, and band rehearsal management.

## Features

- Google Calendar integration for scheduling
- Teacher-student hour tracking and reporting
- Payment tracking system
- Band rehearsal management
- Monthly reports generation

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Google Cloud Platform account (for Calendar API)

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   cd client
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/music-school
   JWT_SECRET=your_jwt_secret_here
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback
   ```

4. Set up Google Calendar API:
   - Go to Google Cloud Console
   - Create a new project
   - Enable Google Calendar API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs

5. Start the development servers:
   ```bash
   # Start backend only
   npm run dev

   # Start frontend only
   npm run client

   # Start both frontend and backend
   npm run dev:full
   ```

## Project Structure

```
├── client/                 # React frontend
├── models/                 # MongoDB models
├── routes/                 # API routes
├── middleware/            # Custom middleware
├── config/                # Configuration files
├── server.js             # Main server file
└── package.json          # Project dependencies
```

## API Endpoints

- `/api/auth` - Authentication routes
- `/api/teachers` - Teacher management
- `/api/students` - Student management
- `/api/bands` - Band management
- `/api/payments` - Payment tracking
- `/api/reports` - Report generation

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request 