# DatBan User Service

## 🎯 Overview

The User Service is the foundational microservice in the DatBan restaurant reservation system, implementing Domain-Driven Design (DDD), CQRS, and event-driven architecture patterns using NestJS.

## 🏗️ Architecture

### Clean Architecture Layers

```
src/
├── core/                    # Domain Layer (Enterprise Business Rules)
│   ├── entities/           # Aggregates, Entities, Value Objects
│   ├── repositories/       # Repository Interfaces (Ports)
│   ├── use-cases/         # Business Use Cases
│   └── events/            # Domain Events
├── application/            # Application Layer (Use Cases)
│   ├── commands/          # Command Pattern (CQRS Write Side)
│   ├── queries/           # Query Pattern (CQRS Read Side)
│   ├── handlers/          # Event Handlers
│   └── dto/               # Data Transfer Objects
├── infrastructure/         # Infrastructure Layer (Adapters)
│   ├── database/          # Database Adapters (TypeORM)
│   ├── messaging/         # Message Bus Adapters (RabbitMQ)
│   ├── repositories/      # Repository Implementations
│   └── config/            # Configuration
└── presentation/          # Presentation Layer (Controllers, HTTP)
    ├── controllers/       # REST API Controllers
    └── guards/            # Authentication Guards
```

## 🚀 Features

### MVP Features

- ✅ User Registration
- ✅ User Login & Authentication
- ✅ JWT Access & Refresh Tokens
- ✅ User Profile Management
- ✅ User Preferences Management
- ✅ Password Change
- ✅ Token Verification
- ✅ Input Validation
- ✅ Health Checks

### Enterprise Patterns

- ✅ Domain-Driven Design (DDD)
- ✅ CQRS (Command Query Responsibility Segregation)
- ✅ Event Sourcing (Domain Events)
- ✅ Clean/Onion Architecture
- ✅ Repository Pattern with Ports & Adapters
- ✅ Value Objects for Type Safety

## 📋 Prerequisites

- Node.js >= 18.0.0
- PostgreSQL >= 13
- npm >= 9.0.0

## ⚡ Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
# Edit .env with your database credentials
```

### 3. Database Setup

```bash
# Create database
createdb datban_users

# Run migrations (when available)
npm run migration:run
```

### 4. Start Service

```bash
# Development mode
npm run start:dev

# Production mode
npm run start:prod
```

## 📚 API Documentation

### Base URL

```
http://localhost:9004/api/v1
```

### Authentication

The API uses JWT Bearer tokens for authentication.

```bash
Authorization: Bearer <jwt_token>
```

### Authentication Endpoints

#### User Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "StrongPassword123!"
}

Response:
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "+1234567890"
  },
  "tokens": {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi..."
  }
}
```

#### Refresh Token

```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOi..."
}
```

#### Change Password

```http
POST /auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword456!"
}
```

#### Verify Token

```http
POST /auth/verify-token
Authorization: Bearer <token>
```

#### Logout

```http
POST /auth/logout
Authorization: Bearer <token>
```

### User Management Endpoints

#### User Registration

```http
POST /users/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "StrongPassword123!",
  "name": "John Doe",
  "phone": "+1234567890",
  "preferences": {
    "cuisineTypes": ["Italian", "Japanese"],
    "dietaryRestrictions": ["vegetarian"],
    "priceRange": { "min": 20, "max": 100 },
    "notifications": {
      "email": true,
      "sms": false,
      "push": true
    },
    "language": "en",
    "timezone": "America/New_York"
  }
}
```

#### Get User Profile

```http
GET /users/profile
Authorization: Bearer <token>
```

#### Update User Profile

```http
PUT /users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Smith",
  "phone": "+1234567891",
  "preferences": {
    "cuisineTypes": ["Mexican", "Thai"]
  }
}
```

### Swagger Documentation

Visit `http://localhost:9004/api/docs` for interactive API documentation.

## 🧪 Testing

### Run Tests

```bash
# Unit tests
npm run test

# Test with coverage
npm run test:cov

# End-to-end tests
npm run test:e2e
```

## 🏗️ Domain Model

### User Aggregate

The `User` entity serves as the aggregate root with business rule enforcement.

### User Preferences Value Object

Encapsulates user preferences with immutability and validation.

### Domain Events

- `UserCreatedEvent` - Published when a new user registers
- `UserUpdatedEvent` - Published when user profile is updated
- `UserDeletedEvent` - Published when user is deactivated

## 🔧 Configuration

### Environment Variables

```bash
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=datban_user
DATABASE_PASSWORD=datban_password
DATABASE_NAME=datban_users

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
```

## 🚀 Deployment

### Docker

```bash
# Build image
docker build -t datban/user-service .

# Run container
docker run -p 9004:9004 datban/user-service
```

## 🔍 Monitoring

### Health Check

```bash
curl http://localhost:9004/health
```

---

**Built with ❤️ using NestJS, TypeScript, and Clean Architecture**
