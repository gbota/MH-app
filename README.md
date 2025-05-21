# Music Hub Application

A comprehensive web application for managing music education, including user authentication, lesson scheduling, and reporting.

## 🌟 Features

- 🔐 **User Authentication**
  - Secure JWT-based authentication
  - Role-based access control (Admin, Teacher, Student)
  - Account lockout after multiple failed attempts

- 📅 **Scheduling & Management**
  - Lesson scheduling
  - Band rehearsal management
  - Teacher-student hour tracking

- 📊 **Reporting**
  - Automated report generation
  - Custom report templates
  - Export to PDF/Excel

- 🚀 **Modern Tech Stack**
  - Node.js & Express backend
  - React frontend
  - MongoDB with Mongoose
  - Docker containerization
  - JWT authentication

## 🛠 Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher) or yarn
- Docker & Docker Compose (for containerization)
- MongoDB (local or MongoDB Atlas)

## 🚀 Quick Start with Docker

The easiest way to get started is using Docker Compose:

```bash
# 1. Clone the repository
git clone <repository-url>
cd music-hub

# 2. Copy the example environment file
cp .env.example .env

# 3. Build and start the containers
docker-compose up --build

# The application will be available at:
# Frontend: http://localhost:3000
# Backend API: http://localhost:5050
# MongoDB: mongodb://mongo:27017/music-hub
```

## 🏗 Manual Setup

### Backend Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file based on the example:
   ```bash
   cp .env.example .env
   ```
   Update the environment variables in `.env` as needed.

3. Start the development server:
   ```bash
   # Development mode with hot-reload
   npm run dev

   # Production mode
   npm start
   ```

### Frontend Setup

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

## 🔧 Environment Variables

See `.env.example` for all available environment variables. The most important ones are:

- `NODE_ENV` - Application environment (development, production, test)
- `PORT` - Port to run the server on
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT token generation
- `JWT_EXPIRE` - JWT token expiration time
- `ADMIN_EMAIL` - Default admin email
- `ADMIN_PASSWORD` - Default admin password

## 📚 API Documentation

API documentation is available at `/api-docs` when running in development mode.

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate test coverage report
npm run test:coverage
```

## 🐳 Docker

Build the Docker image:

```bash
docker build -t music-hub -f Dockerfile.backend .
```

Run the container:

```bash
docker run -p 5050:5050 --env-file .env music-hub
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [React](https://reactjs.org/)
- [Docker](https://www.docker.com/)
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