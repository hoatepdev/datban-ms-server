# DatBan - Restaurant Reservation System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10%2B-red.svg)](https://nestjs.com/)
[![Docker](https://img.shields.io/badge/Docker-enabled-blue.svg)](https://www.docker.com/)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-ready-blue.svg)](https://kubernetes.io/)

A modern, scalable microservices-based restaurant reservation system built with enterprise-grade architecture patterns including Domain-Driven Design (DDD), Onion Architecture, and event-driven communication.

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Architecture](#-architecture)
- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Services](#-services)
- [API Documentation](#-api-documentation)
- [Development](#-development)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Monitoring & Troubleshooting](#-monitoring--troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

## 🎯 Project Overview

DatBan is a comprehensive restaurant reservation system designed with microservices architecture to handle high-scale restaurant booking operations. The system provides:

- **Multi-tenant restaurant management**
- **Real-time table availability**
- **Automated payment processing**
- **Smart notification system**
- **Analytics and reporting**
- **Role-based access control**

### Key Features

- 🏗️ **Microservices Architecture** - Independently deployable services
- 🔄 **Event-Driven Communication** - RabbitMQ for async messaging
- 🚀 **High Performance** - gRPC for synchronous service communication
- 🛡️ **Enterprise Security** - JWT authentication, API gateway protection
- 📊 **Observability** - Comprehensive logging, metrics, and tracing
- 🔍 **Polyglot Persistence** - MongoDB, PostgreSQL, Redis for optimal data storage
- 🧪 **100% Test Coverage** - Unit, integration, and E2E testing

## 🏛️ Architecture

### System Architecture Diagram

```
                    ┌─────────────────────────────────────┐
                    │            Kong Gateway             │
                    │    (Authentication, Rate Limiting)  │
                    └─────────────────┬───────────────────┘
                                      │
                    ┌─────────────────┴───────────────────┐
                    │            Load Balancer            │
                    └─────────────────┬───────────────────┘
                                      │
        ┌─────────────────────────────┼─────────────────────────────┐
        │                             │                             │
┌───────▼──────┐            ┌────────▼────────┐            ┌───────▼──────┐
│ User Service │            │Restaurant Service│           │Reservation   │
│(PostgreSQL)  │            │   (MongoDB)      │           │Service       │
│              │            │                  │           │(PostgreSQL)  │
└──────┬───────┘            └────────┬────────┘            └───────┬──────┘
       │                             │                             │
       └─────────────────────────────┼─────────────────────────────┘
                                     │
       ┌─────────────────────────────┼─────────────────────────────┐
       │                             │                             │
┌──────▼──────┐            ┌────────▼────────┐            ┌───────▼──────┐
│Notification │            │  Payment Svc    │            │ Analytics    │
│Service      │            │  (PostgreSQL)   │            │ Service      │
│(Redis)      │            │                 │            │ (MongoDB)    │
└─────────────┘            └─────────────────┘            └──────────────┘
       │                             │                             │
       └─────────────────────────────┼─────────────────────────────┘
                                     │
                    ┌─────────────────▼───────────────────┐
                    │            RabbitMQ                 │
                    │        (Event Bus)                  │
                    └─────────────────────────────────────┘
```

### Communication Patterns

- **Synchronous**: gRPC for real-time service-to-service communication
- **Asynchronous**: RabbitMQ for event-driven messaging
- **External**: REST APIs through Kong Gateway
- **Caching**: Redis for session management and high-frequency data

## 🔧 Prerequisites

### Required Software

- **Node.js** >= 18.0.0
- **yarn** >= 1.22.0
- **Docker** >= 24.0.0
- **Docker Compose** >= 2.0.0
- **Git** >= 2.30.0

### Recommended Tools

- **Kubernetes** >= 1.28 (for production deployment)
- **kubectl** (for Kubernetes management)
- **Helm** >= 3.0 (for K8s package management)
- **Artillery** (for load testing)

### Development Environment

```bash
# Check prerequisites
node --version    # >= 18.0.0
yarn --version    # >= 1.22.0
docker --version  # >= 24.0.0
```

## ⚡ Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/your-org/datban-microservices.git
cd datban-microservices
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Install dependencies
yarn

# Generate Protocol Buffers
yarn proto:generate
```

### 3. Start Infrastructure

```bash
# Start databases and message broker
yarn docker:up

# Wait for services to be ready (30-60 seconds)
docker-compose -f infrastructure/docker-compose.yml ps
```

### 4. Run Services

```bash
# Start all services in development mode
yarn dev

# Or start individual services
yarn dev:user
yarn dev:restaurant
yarn dev:reservation
```

### 5. Verify Installation

```bash
# Health check all services
curl http://localhost:9004/health  # User Service
curl http://localhost:9006/health  # Restaurant Service
curl http://localhost:9008/health  # Reservation Service

# View logs
yarn docker:logs
```

## 🔧 Services

### Core Services

| Service                  | Port | Database   | Description                               |
| ------------------------ | ---- | ---------- | ----------------------------------------- |
| **User Service**         | 9004 | PostgreSQL | User management, authentication, profiles |
| **Restaurant Service**   | 9006 | MongoDB    | Restaurant data, menus, availability      |
| **Reservation Service**  | 9008 | PostgreSQL | Booking management, scheduling            |
| **Payment Service**      | 9010 | PostgreSQL | Payment processing, billing               |
| **Notification Service** | 9012 | Redis      | Email, SMS, push notifications            |
| **Analytics Service**    | 9014 | MongoDB    | Reporting, business intelligence          |

### Infrastructure Services

| Service          | Port        | Purpose                              |
| ---------------- | ----------- | ------------------------------------ |
| **Kong Gateway** | 8000        | API Gateway, authentication          |
| **RabbitMQ**     | 5672, 15672 | Message broker, event bus            |
| **PostgreSQL**   | 5432        | Primary database for ACID operations |
| **MongoDB**      | 27017       | Document store for flexible schemas  |
| **Redis**        | 6379        | Caching, session store               |

## 📚 API Documentation

### REST API Endpoints

```bash
# User Management
POST   /api/v1/users/register
POST   /api/v1/users/login
GET    /api/v1/users/profile
PUT    /api/v1/users/profile

# Restaurant Management
GET    /api/v1/restaurants
GET    /api/v1/restaurants/:id
POST   /api/v1/restaurants
PUT    /api/v1/restaurants/:id

# Reservations
POST   /api/v1/reservations
GET    /api/v1/reservations/:id
PUT    /api/v1/reservations/:id
DELETE /api/v1/reservations/:id
```

### gRPC Services

```protobuf
// User Service
service UserService {
  rpc GetUser(GetUserRequest) returns (GetUserResponse);
  rpc ValidateUser(ValidateUserRequest) returns (ValidateUserResponse);
  rpc GetUserPreferences(GetUserPreferencesRequest) returns (GetUserPreferencesResponse);
}

// Restaurant Service
service RestaurantService {
  rpc GetRestaurant(GetRestaurantRequest) returns (GetRestaurantResponse);
  rpc CheckAvailability(CheckAvailabilityRequest) returns (CheckAvailabilityResponse);
}
```

## 🛠️ Development

### Project Structure

```
datban-microservices/
├── apps/                           # Microservices
│   ├── user-service/
│   ├── restaurant-service/
│   ├── reservation-service/
│   ├── payment-service/
│   ├── notification-service/
│   └── analytics-service/
├── libs/                           # Shared libraries
│   ├── proto/                      # Protocol buffer definitions
│   ├── common/                     # Shared utilities
│   └── events/                     # Event schemas
├── infrastructure/                 # Infrastructure as code
│   ├── docker-compose.yml
│   ├── k8s/                        # Kubernetes manifests
│   └── monitoring/                 # Observability stack
└── scripts/                        # Automation scripts
```

### Available Scripts

```bash
# Development
yarn dev                    # Start all services
yarn dev:user              # Start user service only
yarn build                 # Build all services
yarn proto:generate        # Generate protobuf files

# Database
yarn migration:generate:user    # Generate new migration
yarn migration:run:user         # Run pending migrations
yarn seed:test-users           # Seed test data

# Code Quality
yarn lint                  # Lint all code
yarn format               # Format code with prettier
yarn format:check         # Check formatting
```

### Environment Configuration

Key environment variables:

```bash
# Database URLs
DATABASE_URL=postgresql://user:pass@localhost:5432/datban_users
MONGODB_URL=mongodb://localhost:27017/datban_restaurants
REDIS_URL=redis://localhost:6379

# Message Broker
RABBITMQ_URL=amqp://localhost:5672

# JWT Configuration
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# API Gateway
KONG_ADMIN_URL=http://localhost:9001
```

## 🧪 Testing

### Test Categories

- **Unit Tests**: Individual component testing
- **Integration Tests**: Service integration testing
- **E2E Tests**: End-to-end workflow testing
- **Load Tests**: Performance and scalability testing

### Running Tests

```bash
# Unit tests
yarn test                     # All services
yarn test:user               # Specific service

# Integration tests
yarn test:integration        # All integration tests
yarn test:integration:user   # Service-specific integration

# End-to-end tests
yarn test:e2e               # Full workflow tests

# Load testing
yarn test:load              # Performance tests

# Coverage reports
yarn test:coverage          # Generate coverage report
```

### Test Database Setup

```bash
# Start test containers
docker-compose -f docker-compose.test.yml up -d

# Run migrations for test databases
yarn migration:run:test

# Seed test data
yarn seed:test-data
```

## 🚀 Deployment

### Docker Deployment

```bash
# Build all service images
yarn docker:build

# Deploy to staging
docker-compose -f docker-compose.staging.yml up -d

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d
```

### Kubernetes Deployment

```bash
# Deploy infrastructure
kubectl apply -f infrastructure/k8s/namespace.yml
kubectl apply -f infrastructure/k8s/secrets.yml
kubectl apply -f infrastructure/k8s/configmaps.yml

# Deploy databases
kubectl apply -f infrastructure/k8s/databases/

# Deploy services
yarn k8s:deploy

# Check deployment status
kubectl get pods -n datban
kubectl get services -n datban
```

### Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificates installed
- [ ] Monitoring stack deployed
- [ ] Backup strategy implemented
- [ ] Load balancer configured
- [ ] DNS records updated

## 📊 Monitoring & Troubleshooting

### Monitoring Stack

```bash
# Start monitoring infrastructure
yarn monitoring:up

# Access monitoring dashboards
open http://localhost:9600    # Grafana (admin/admin)
open http://localhost:9090    # Prometheus
open http://localhost:16686   # Jaeger (distributed tracing)
```

### Health Checks

```bash
# Service health endpoints
curl http://localhost:9004/health
curl http://localhost:9006/health
curl http://localhost:9008/health

# Infrastructure health
curl http://localhost:9015   # RabbitMQ Management
curl http://localhost:9001    # Kong Admin API
```

### Log Management

```bash
# View service logs
yarn docker:logs

# Follow specific service logs
docker-compose logs -f user-service
docker-compose logs -f restaurant-service

# Application logs location
tail -f apps/user-service/logs/application.log
```

### Common Issues

**Service Won't Start**

```bash
# Check dependencies
docker-compose ps
yarn docker:logs

# Verify environment variables
cat .env
```

**Database Connection Issues**

```bash
# Test database connectivity
docker exec -it postgres psql -U datban_user -d datban_users
docker exec -it mongodb mongosh datban_restaurants
```

**Message Queue Problems**

```bash
# Check RabbitMQ status
curl http://localhost:15672/api/nodes
docker exec -it rabbitmq rabbitmqctl status
```

## 🤝 Contributing

### Development Workflow

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** changes: `git commit -m 'Add amazing feature'`
4. **Push** to branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Code Standards

- **TypeScript** for all code
- **ESLint** and **Prettier** for code formatting
- **Jest** for testing
- **Conventional Commits** for commit messages
- **100% test coverage** requirement

### Pre-commit Hooks

```bash
# Install git hooks
yarn prepare

# Hooks will automatically run:
# - ESLint
# - Prettier
# - Unit tests
# - Type checking
```

### Architecture Guidelines

- Follow **Domain-Driven Design** principles
- Implement **Onion Architecture** pattern
- Use **Ports and Adapters** for external integrations
- Maintain **single responsibility** for each service
- Apply **SOLID principles**

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Documentation](./docs/)
- [API Reference](./docs/api/)
- [Architecture Guide](./microservices-architecture.md)
- [Contributing Guide](./CONTRIBUTING.md)
- [Changelog](./CHANGELOG.md)

---

**Built with ❤️ by the DatBan Team**
