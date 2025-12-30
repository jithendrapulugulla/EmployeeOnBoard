# Docker Compose Quick Start Guide

This Docker Compose setup allows you to run the entire application locally with the same containerization as Azure.

## Prerequisites

- Docker Desktop installed ([Download](https://www.docker.com/products/docker-desktop))
- Docker Compose (included with Docker Desktop)

## Quick Start

### 1. Start All Services

```bash
# Navigate to project root
cd path/to/EmployeeOnBoard

# Start services
docker-compose up --build

# Or run in background
docker-compose up --build -d
```

### 2. Verify Services Are Running

```bash
# Check status of all services
docker-compose ps

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

### 3. Access the Application

- **Frontend**: http://localhost:80 or http://localhost:3000
- **Backend API**: http://localhost:8080/api
- **Health Check**: http://localhost:8080/health
- **MongoDB**: localhost:27017

## Environment Variables

Create a `.env` file in the project root for Docker Compose:

```bash
JWT_SECRET=your-secret-jwt-key
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
```

## Common Commands

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (warning: deletes data)
docker-compose down -v

# Rebuild images
docker-compose build --no-cache

# View container logs
docker-compose logs [service_name]

# Execute command in running container
docker-compose exec backend sh
docker-compose exec frontend sh

# Restart a specific service
docker-compose restart backend

# Remove all containers/images
docker-compose down -v --remove-orphans
```

## Testing the Application

```bash
# Backend health check
curl http://localhost:8080/health

# Frontend index
curl http://localhost:80/

# Login endpoint (test backend)
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'
```

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 8080
lsof -ti:8080 | xargs kill -9

# Or use different port
docker-compose up -p 8081:8080
```

### Database Connection Issues

```bash
# Check MongoDB is running
docker-compose logs mongodb

# Reset database
docker-compose down -v
docker-compose up --build
```

### Frontend Can't Connect to Backend

Make sure `REACT_APP_API_BASE_URL` is set to `http://localhost:8080/api` in `.env.development`

## Scaling Services

```bash
# Scale backend to 2 instances
docker-compose up -d --scale backend=2

# Scale frontend to 2 instances
docker-compose up -d --scale frontend=2
```

## Production-like Testing

To test with production-like settings:

```bash
# Use production environment
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up
```

## Clean Up

```bash
# Remove all containers, networks, and volumes
docker-compose down -v

# Remove images too
docker-compose down -v --rmi all
```

## Next Steps

After testing locally:
1. Push code to GitHub
2. Use GitHub Actions for CI/CD
3. Deploy to Azure using the provided scripts
4. Monitor and scale as needed
