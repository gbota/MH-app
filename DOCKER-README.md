# Music Hub App - Docker Setup

This guide explains how to run the Music Hub application using Docker.

## Prerequisites

- Docker installed on your system
- Docker Compose (usually comes with Docker Desktop)

## Quick Start

1. **Clone the repository** (if you haven't already)
   ```bash
   git clone <repository-url>
   cd mh-app-v2
   ```

2. **Build and start the containers**
   ```bash
   docker-compose up --build
   ```
   This will:
   - Build the backend and frontend Docker images
   - Start all the services
   - The frontend will be available at http://localhost:3000
   - The backend API will be available at http://localhost:5050

3. **Access the application**
   - Open your browser and go to: http://localhost:3000

## Environment Variables

### Backend

Create a `.env` file in the project root with the following variables:

```
NODE_ENV=production
PORT=5050
# Add any other environment variables your backend needs
```

### Frontend

Create a `.env` file in the `client` directory with the following variables:

```
REACT_APP_API_URL=/api  # This will proxy to the backend in production
```

## Development Workflow

### Rebuilding after changes

When you make changes to the code, you'll need to rebuild the containers:

```bash
docker-compose up --build
```

### Viewing logs

To view logs from all containers:

```bash
docker-compose logs -f
```

For specific service logs:

```bash
docker-compose logs -f frontend
docker-compose logs -f backend
```

### Stopping the application

To stop all containers:

```bash
docker-compose down
```

## Production Deployment

For production deployment, you should:

1. Set appropriate environment variables
2. Use a reverse proxy like Nginx or Traefik
3. Set up SSL certificates
4. Configure proper logging and monitoring

## Troubleshooting

### Port conflicts

If you get port conflicts, you can change the published ports in `docker-compose.yml`.

### Build issues

If you encounter build issues, try:

1. Cleaning up Docker resources:
   ```bash
   docker system prune
   ```
2. Rebuilding with no cache:
   ```bash
   docker-compose build --no-cache
   ```

### Database persistence

If you enable MongoDB in the future, uncomment the MongoDB service in `docker-compose.yml` and the volumes section at the bottom.
