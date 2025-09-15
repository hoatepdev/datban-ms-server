# DatBan Restaurant Reservation System - Microservices Architecture

## 🏛️ Architecture Overview

### Microservices Decomposition

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Service  │    │Restaurant Service│   │Reservation Svc  │
│   (PostgreSQL)  │    │   (MongoDB)      │    │  (PostgreSQL)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
         ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
         │Notification Svc │    │  Payment Svc    │    │ Analytics Svc   │
         │    (Redis)      │    │  (PostgreSQL)   │    │   (MongoDB)     │
         └─────────────────┘    └─────────────────┘    └─────────────────┘
                                         │
                    ┌─────────────────────────────────────┐
                    │            RabbitMQ                 │
                    │        (Event Bus)                  │
                    └─────────────────────────────────────┘
                                         │
                    ┌─────────────────────────────────────┐
                    │            Kong Gateway             │
                    │    (Authentication, Rate Limiting)  │
                    └─────────────────────────────────────┘
```

## 📦 Service Breakdown

### 1. User Service

**Responsibility**: User management, authentication, profiles
**Database**: PostgreSQL
**Communication**:

- Publishes: `UserCreated`, `UserUpdated`, `UserDeleted`
- Consumes: `ReservationCompleted` (for user stats)

### 2. Restaurant Service

**Responsibility**: Restaurant management, menus, availability
**Database**: MongoDB
**Communication**:

- Publishes: `RestaurantCreated`, `RestaurantUpdated`, `MenuUpdated`, `AvailabilityChanged`
- Consumes: `ReservationCreated` (to update availability)

### 3. Reservation Service

**Responsibility**: Booking management, scheduling
**Database**: PostgreSQL  
**Communication**:

- Publishes: `ReservationCreated`, `ReservationConfirmed`, `ReservationCancelled`
- Consumes: `PaymentProcessed`, `UserCreated`, `RestaurantUpdated`

### 4. Payment Service

**Responsibility**: Payment processing, billing
**Database**: PostgreSQL
**Communication**:

- Publishes: `PaymentProcessed`, `PaymentFailed`, `RefundProcessed`
- Consumes: `ReservationCreated`, `ReservationCancelled`

### 5. Notification Service

**Responsibility**: Email, SMS, push notifications
**Database**: Redis (for templates and queues)
**Communication**:

- Consumes: All major events for notification triggers

### 6. Analytics Service

**Responsibility**: Reporting, business intelligence
**Database**: MongoDB
**Communication**:

- Consumes: All events for analytics processing

## 🚀 Project Structure

```
datban-microservices/
├── apps/
│   ├── user-service/
│   │   ├── src/
│   │   │   ├── core/                    # Domain layer
│   │   │   │   ├── entities/
│   │   │   │   ├── repositories/        # Repository interfaces
│   │   │   │   ├── use-cases/
│   │   │   │   └── events/              # Domain events
│   │   │   ├── infrastructure/          # Infrastructure layer
│   │   │   │   ├── database/
│   │   │   │   ├── messaging/           # RabbitMQ publishers/consumers
│   │   │   │   ├── grpc/               # gRPC services
│   │   │   │   └── repositories/        # Repository implementations
│   │   │   ├── application/             # Application layer
│   │   │   │   ├── controllers/         # HTTP controllers
│   │   │   │   ├── handlers/            # Event handlers
│   │   │   │   └── adapters/
│   │   │   ├── presentation/            # Presentation layer
│   │   │   │   ├── dto/
│   │   │   │   └── validators/
│   │   │   └── main.ts
│   │   ├── proto/                       # gRPC protobuf files
│   │   ├── test/
│   │   ├── Dockerfile
│   │   └── docker-compose.yml
│   │
│   ├── restaurant-service/              # Similar structure
│   ├── reservation-service/
│   ├── payment-service/
│   ├── notification-service/
│   └── analytics-service/
│
├── libs/                                # Shared libraries
│   ├── common/
│   │   ├── events/                      # Shared event definitions
│   │   ├── grpc/                        # gRPC client/server utilities
│   │   ├── messaging/                   # RabbitMQ abstractions
│   │   ├── database/                    # Database utilities
│   │   └── observability/               # OpenTelemetry, logging
│   ├── proto/                           # Shared protobuf definitions
│   └── testing/                         # Testing utilities
│
├── infrastructure/
│   ├── kong/                            # API Gateway config
│   ├── rabbitmq/                        # RabbitMQ config
│   ├── monitoring/                      # Grafana, Prometheus configs
│   └── docker-compose.yml               # Full stack deployment
│
├── scripts/
│   ├── setup-microservices.sh
│   ├── generate-proto.sh
│   └── run-tests.sh
│
└── docs/
    ├── api/                             # API documentation
    ├── events/                          # Event schemas
    └── deployment/                      # Deployment guides
```

## 🔧 Technology Stack

### Core Technologies

- **Framework**: NestJS 11+ with microservices package
- **Languages**: TypeScript 5.7.3
- **Message Broker**: RabbitMQ with `@nestjs/microservices`
- **RPC**: gRPC with `@grpc/grpc-js`
- **API Gateway**: Kong Gateway
- **Databases**: PostgreSQL, MongoDB, Redis

### Infrastructure

- **Containerization**: Docker & Docker Compose
- **Process Management**: PM2
- **Service Discovery**: Kong + Consul (optional)
- **Load Balancing**: Kong Gateway
- **Monitoring**: Grafana, Prometheus, OpenTelemetry, Zipkin

### Development Tools

- **Testing**: Jest with Testcontainers for integration tests
- **Code Quality**: ESLint, Prettier, Husky
- **Documentation**: Swagger (per service), AsyncAPI (for events)

## 📨 Event-Driven Architecture

### Event Categories

#### User Domain Events

```typescript
// User Service Events
interface UserCreated {
  eventType: "user.created";
  userId: string;
  email: string;
  profile: UserProfile;
  timestamp: Date;
}

interface UserUpdated {
  eventType: "user.updated";
  userId: string;
  changes: Partial<UserProfile>;
  timestamp: Date;
}
```

#### Restaurant Domain Events

```typescript
// Restaurant Service Events
interface RestaurantCreated {
  eventType: "restaurant.created";
  restaurantId: string;
  name: string;
  location: Location;
  capacity: number;
  timestamp: Date;
}

interface AvailabilityChanged {
  eventType: "restaurant.availability.changed";
  restaurantId: string;
  date: Date;
  timeSlots: TimeSlot[];
  timestamp: Date;
}
```

#### Reservation Domain Events

```typescript
// Reservation Service Events
interface ReservationCreated {
  eventType: "reservation.created";
  reservationId: string;
  userId: string;
  restaurantId: string;
  dateTime: Date;
  partySize: number;
  amount: number;
  timestamp: Date;
}

interface ReservationConfirmed {
  eventType: "reservation.confirmed";
  reservationId: string;
  confirmationCode: string;
  timestamp: Date;
}
```

### RabbitMQ Configuration

#### Exchange and Queue Setup

```typescript
// Message Broker Configuration
export const RABBITMQ_CONFIG = {
  exchanges: {
    USER_EVENTS: "user.events",
    RESTAURANT_EVENTS: "restaurant.events",
    RESERVATION_EVENTS: "reservation.events",
    PAYMENT_EVENTS: "payment.events",
    NOTIFICATION_EVENTS: "notification.events",
  },
  queues: {
    // User Service Queues
    USER_RESERVATIONS: "user.reservations",

    // Restaurant Service Queues
    RESTAURANT_RESERVATIONS: "restaurant.reservations",

    // Reservation Service Queues
    RESERVATION_PAYMENTS: "reservation.payments",
    RESERVATION_NOTIFICATIONS: "reservation.notifications",

    // Payment Service Queues
    PAYMENT_RESERVATIONS: "payment.reservations",

    // Notification Service Queues
    NOTIFICATIONS_ALL: "notifications.all",

    // Analytics Service Queues
    ANALYTICS_ALL: "analytics.all",
  },
};
```

## 🔌 gRPC Communication

### Service Definitions

#### User Service gRPC

```protobuf
// proto/user.proto
syntax = "proto3";

package user;

service UserService {
  rpc GetUser(GetUserRequest) returns (GetUserResponse);
  rpc ValidateUser(ValidateUserRequest) returns (ValidateUserResponse);
  rpc GetUserPreferences(GetUserPreferencesRequest) returns (GetUserPreferencesResponse);
}

message User {
  string id = 1;
  string email = 2;
  string name = 3;
  string phone = 4;
  UserPreferences preferences = 5;
}

message GetUserRequest {
  string user_id = 1;
}

message GetUserResponse {
  User user = 1;
}
```

#### Restaurant Service gRPC

```protobuf
// proto/restaurant.proto
syntax = "proto3";

package restaurant;

service RestaurantService {
  rpc GetRestaurant(GetRestaurantRequest) returns (GetRestaurantResponse);
  rpc CheckAvailability(CheckAvailabilityRequest) returns (CheckAvailabilityResponse);
  rpc GetMenu(GetMenuRequest) returns (GetMenuResponse);
}

message Restaurant {
  string id = 1;
  string name = 2;
  Location location = 3;
  int32 capacity = 4;
  repeated TimeSlot available_slots = 5;
}
```

## 🌐 Kong API Gateway Configuration

### Gateway Setup

```yaml
# infrastructure/kong/kong.yml
_format_version: "3.0"
_transform: true

services:
  - name: user-service
    url: http://user-service:3001
    plugins:
      - name: rate-limiting
        config:
          minute: 100
          hour: 1000
      - name: jwt
        config:
          secret_is_base64: false
    routes:
      - name: user-routes
        paths: ["/api/v1/users"]

  - name: restaurant-service
    url: http://restaurant-service:3002
    routes:
      - name: restaurant-routes
        paths: ["/api/v1/restaurants"]

  - name: reservation-service
    url: http://reservation-service:3003
    routes:
      - name: reservation-routes
        paths: ["/api/v1/reservations"]

  - name: payment-service
    url: http://payment-service:3004
    routes:
      - name: payment-routes
        paths: ["/api/v1/payments"]

consumers:
  - username: datban-client
    jwt_secrets:
      - key: datban-key
        secret: your-jwt-secret
```

## 🗄️ Database Strategy

### Database per Service

#### User Service - PostgreSQL

```sql
-- Users table with enhanced profile
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    preferences JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
```

#### Restaurant Service - MongoDB

```javascript
// Restaurant Schema
{
  _id: ObjectId,
  name: String,
  description: String,
  location: {
    address: String,
    coordinates: [Number, Number], // [longitude, latitude]
    city: String,
    zipCode: String
  },
  capacity: Number,
  cuisine: [String],
  priceRange: String, // $, $$, $$$, $$$$
  hours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    // ... other days
  },
  menu: [{
    category: String,
    items: [{
      name: String,
      description: String,
      price: Number,
      allergens: [String]
    }]
  }],
  availability: [{
    date: Date,
    timeSlots: [{
      time: String,
      availableSpots: Number,
      totalSpots: Number
    }]
  }],
  rating: {
    average: Number,
    totalReviews: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### Reservation Service - PostgreSQL

```sql
-- Reservations with comprehensive tracking
CREATE TABLE reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    restaurant_id VARCHAR(255) NOT NULL, -- MongoDB ObjectId as string
    reservation_date DATE NOT NULL,
    reservation_time TIME NOT NULL,
    party_size INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    special_requests TEXT,
    confirmation_code VARCHAR(10) UNIQUE,
    amount DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reservations_user_id ON reservations(user_id);
CREATE INDEX idx_reservations_restaurant_id ON reservations(restaurant_id);
CREATE INDEX idx_reservations_date ON reservations(reservation_date);
CREATE INDEX idx_reservations_status ON reservations(status);
```

#### Payment Service - PostgreSQL

```sql
-- Payments with comprehensive tracking
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_id UUID NOT NULL,
    user_id UUID NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    payment_method VARCHAR(50),
    payment_provider VARCHAR(50),
    provider_transaction_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Notification Service - Redis

```redis
# Notification templates and queues
HSET notification:templates:reservation_confirmed subject "Reservation Confirmed - {{restaurantName}}"
HSET notification:templates:reservation_confirmed body "Your reservation for {{partySize}} at {{restaurantName}} on {{date}} at {{time}} has been confirmed."

# Notification queues
LPUSH notification:queue:email "{'userId':'123','template':'reservation_confirmed','data':{'restaurantName':'Test Restaurant'}}"
```

## 🔄 Implementation Steps

### Phase 1: Infrastructure Setup

1. **Setup RabbitMQ cluster with appropriate exchanges and queues**
2. **Configure Kong Gateway with service discovery**
3. **Setup databases (PostgreSQL clusters, MongoDB replica set, Redis cluster)**
4. **Configure monitoring stack (Prometheus, Grafana, Zipkin)**

### Phase 2: Core Services Development

1. **User Service**: Authentication, user management, JWT integration
2. **Restaurant Service**: Restaurant CRUD, menu management, availability
3. **Reservation Service**: Booking logic, scheduling, state management

### Phase 3: Supporting Services

1. **Payment Service**: Payment processing, billing, refunds
2. **Notification Service**: Multi-channel notifications, templates
3. **Analytics Service**: Event aggregation, reporting, insights

### Phase 4: Integration & Testing

1. **Event-driven workflow testing**
2. **gRPC inter-service communication**
3. **End-to-end integration tests**
4. **Performance and load testing**

### Phase 5: Observability & Production

1. **Complete observability stack implementation**
2. **Production deployment configurations**
3. **CI/CD pipeline setup**
4. **Disaster recovery procedures**

## 🧪 Testing Strategy

### Testing Pyramid for Microservices

#### Unit Tests (70%)

```typescript
// Example: Reservation Service Unit Test
describe("CreateReservationUseCase", () => {
  it("should create reservation and publish event", async () => {
    // Given
    const createReservationDto = {
      userId: "user-123",
      restaurantId: "restaurant-456",
      dateTime: new Date("2024-12-25T19:00:00Z"),
      partySize: 4,
    };

    // When
    const result = await createReservationUseCase.execute(createReservationDto);

    // Then
    expect(result.reservation).toBeDefined();
    expect(eventPublisher.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "reservation.created",
        reservationId: result.reservation.id,
      })
    );
  });
});
```

#### Integration Tests (20%)

```typescript
// Example: Service Integration Test with RabbitMQ
describe("Reservation Service Integration", () => {
  beforeAll(async () => {
    // Setup test containers
    rabbitMQContainer = await new GenericContainer("rabbitmq:3-management")
      .withExposedPorts(5672, 15672)
      .start();

    postgresContainer = await new PostgreSqlContainer()
      .withDatabase("test_reservations")
      .start();
  });

  it("should process reservation creation workflow", async () => {
    // Test full reservation creation with event publishing
    const reservation = await reservationService.createReservation(testData);

    // Verify event was published and consumed
    await waitForEventProcessing();
    expect(notificationService.emailsSent).toHaveLength(1);
    expect(analyticsService.eventsProcessed).toContain("reservation.created");
  });
});
```

#### End-to-End Tests (10%)

```typescript
// Example: Complete workflow E2E test
describe("Restaurant Reservation E2E", () => {
  it("should complete full reservation workflow", async () => {
    // 1. User registration
    const user = await createTestUser();

    // 2. Restaurant creation
    const restaurant = await createTestRestaurant();

    // 3. Check availability
    const availability = await checkAvailability(restaurant.id, testDate);
    expect(availability.slots.length).toBeGreaterThan(0);

    // 4. Create reservation
    const reservation = await createReservation({
      userId: user.id,
      restaurantId: restaurant.id,
      dateTime: testDate,
      partySize: 2,
    });

    // 5. Process payment
    const payment = await processPayment(reservation.id, paymentData);
    expect(payment.status).toBe("completed");

    // 6. Verify confirmation
    await waitForAsync();
    const confirmedReservation = await getReservation(reservation.id);
    expect(confirmedReservation.status).toBe("confirmed");
    expect(confirmedReservation.confirmationCode).toBeDefined();
  });
});
```

## 📊 Monitoring & Observability

### Metrics Collection

```typescript
// Custom metrics for each service
export class ReservationMetrics {
  private readonly reservationCounter = new Counter({
    name: "datban_reservations_total",
    help: "Total number of reservations created",
    labelNames: ["restaurant_id", "status"],
  });

  private readonly reservationDuration = new Histogram({
    name: "datban_reservation_processing_duration_seconds",
    help: "Duration of reservation processing",
    buckets: [0.1, 0.5, 1, 2, 5],
  });

  recordReservationCreated(restaurantId: string, status: string) {
    this.reservationCounter.inc({ restaurant_id: restaurantId, status });
  }

  recordProcessingTime(duration: number) {
    this.reservationDuration.observe(duration);
  }
}
```

### Distributed Tracing

```typescript
// OpenTelemetry setup for distributed tracing
export class TracingService {
  private tracer: Tracer;

  constructor() {
    this.tracer = trace.getTracer("datban-reservation-service");
  }

  async traceReservationCreation<T>(
    spanName: string,
    operation: () => Promise<T>
  ): Promise<T> {
    return await this.tracer.startActiveSpan(spanName, async (span) => {
      try {
        span.setAttributes({
          "service.name": "reservation-service",
          "operation.type": "create_reservation",
        });

        const result = await operation();
        span.setStatus({ code: SpanStatusCode.OK });
        return result;
      } catch (error) {
        span.recordException(error);
        span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
        throw error;
      } finally {
        span.end();
      }
    });
  }
}
```

## 🚢 Deployment Configuration

### Docker Compose for Full Stack

```yaml
# infrastructure/docker-compose.yml
version: "3.8"

services:
  # API Gateway
  kong:
    image: kong:3.4
    ports:
      - "8000:8000"
      - "8001:8001"
      - "8443:8443"
      - "8444:8444"
    environment:
      KONG_DATABASE: "off"
      KONG_DECLARATIVE_CONFIG: /kong/kong.yml
      KONG_PROXY_ACCESS_LOG: /dev/stdout
      KONG_ADMIN_ACCESS_LOG: /dev/stdout
    volumes:
      - ./kong/kong.yml:/kong/kong.yml
    networks:
      - datban-network

  # Message Broker
  rabbitmq:
    image: rabbitmq:3.12-management
    ports:
      - "5672:5672"
      - "15672:15672"
    environment:
      RABBITMQ_DEFAULT_USER: datban
      RABBITMQ_DEFAULT_PASS: datban123
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
      - ./rabbitmq/rabbitmq.conf:/etc/rabbitmq/rabbitmq.conf
    networks:
      - datban-network

  # Databases
  postgres-users:
    image: postgres:15
    environment:
      POSTGRES_DB: datban_users
      POSTGRES_USER: datban
      POSTGRES_PASSWORD: datban123
    ports:
      - "5432:5432"
    volumes:
      - postgres_users_data:/var/lib/postgresql/data
    networks:
      - datban-network

  postgres-reservations:
    image: postgres:15
    environment:
      POSTGRES_DB: datban_reservations
      POSTGRES_USER: datban
      POSTGRES_PASSWORD: datban123
    ports:
      - "5433:5432"
    volumes:
      - postgres_reservations_data:/var/lib/postgresql/data
    networks:
      - datban-network

  postgres-payments:
    image: postgres:15
    environment:
      POSTGRES_DB: datban_payments
      POSTGRES_USER: datban
      POSTGRES_PASSWORD: datban123
    ports:
      - "5434:5432"
    volumes:
      - postgres_payments_data:/var/lib/postgresql/data
    networks:
      - datban-network

  mongodb:
    image: mongo:7.0
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: datban
      MONGO_INITDB_ROOT_PASSWORD: datban123
      MONGO_INITDB_DATABASE: datban_restaurants
    volumes:
      - mongodb_data:/data/db
    networks:
      - datban-network

  redis:
    image: redis:7.2-alpine
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    networks:
      - datban-network

  # Microservices
  user-service:
    build:
      context: ./apps/user-service
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
      - "50051:50051" # gRPC port
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://datban:datban123@postgres-users:5432/datban_users
      RABBITMQ_URL: amqp://datban:datban123@rabbitmq:5672
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres-users
      - rabbitmq
      - redis
    networks:
      - datban-network

  restaurant-service:
    build:
      context: ./apps/restaurant-service
      dockerfile: Dockerfile
    ports:
      - "3002:3002"
      - "50052:50052" # gRPC port
    environment:
      NODE_ENV: production
      MONGODB_URL: mongodb://datban:datban123@mongodb:27017/datban_restaurants?authSource=admin
      RABBITMQ_URL: amqp://datban:datban123@rabbitmq:5672
      REDIS_URL: redis://redis:6379
    depends_on:
      - mongodb
      - rabbitmq
      - redis
    networks:
      - datban-network

  reservation-service:
    build:
      context: ./apps/reservation-service
      dockerfile: Dockerfile
    ports:
      - "3003:3003"
      - "50053:50053" # gRPC port
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://datban:datban123@postgres-reservations:5432/datban_reservations
      RABBITMQ_URL: amqp://datban:datban123@rabbitmq:5672
      USER_SERVICE_GRPC: user-service:50051
      RESTAURANT_SERVICE_GRPC: restaurant-service:50052
    depends_on:
      - postgres-reservations
      - rabbitmq
      - user-service
      - restaurant-service
    networks:
      - datban-network

  payment-service:
    build:
      context: ./apps/payment-service
      dockerfile: Dockerfile
    ports:
      - "3004:3004"
      - "50054:50054" # gRPC port
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://datban:datban123@postgres-payments:5432/datban_payments
      RABBITMQ_URL: amqp://datban:datban123@rabbitmq:5672
      STRIPE_SECRET_KEY: ${STRIPE_SECRET_KEY}
    depends_on:
      - postgres-payments
      - rabbitmq
    networks:
      - datban-network

  notification-service:
    build:
      context: ./apps/notification-service
      dockerfile: Dockerfile
    ports:
      - "3005:3005"
    environment:
      NODE_ENV: production
      RABBITMQ_URL: amqp://datban:datban123@rabbitmq:5672
      REDIS_URL: redis://redis:6379
      SMTP_HOST: ${SMTP_HOST}
      SMTP_USER: ${SMTP_USER}
      SMTP_PASS: ${SMTP_PASS}
    depends_on:
      - rabbitmq
      - redis
    networks:
      - datban-network

  analytics-service:
    build:
      context: ./apps/analytics-service
      dockerfile: Dockerfile
    ports:
      - "3006:3006"
    environment:
      NODE_ENV: production
      MONGODB_URL: mongodb://datban:datban123@mongodb:27017/datban_analytics?authSource=admin
      RABBITMQ_URL: amqp://datban:datban123@rabbitmq:5672
    depends_on:
      - mongodb
      - rabbitmq
    networks:
      - datban-network

  # Monitoring Stack
  prometheus:
    image: prom/prometheus:v2.45.0
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - "--config.file=/etc/prometheus/prometheus.yml"
      - "--storage.tsdb.path=/prometheus"
      - "--web.console.libraries=/etc/prometheus/console_libraries"
      - "--web.console.templates=/etc/prometheus/consoles"
      - "--web.enable-lifecycle"
    networks:
      - datban-network

  grafana:
    image: grafana/grafana:10.1.0
    ports:
      - "3000:3000"
    environment:
      GF_SECURITY_ADMIN_PASSWORD: datban123
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana/dashboards:/etc/grafana/provisioning/dashboards
      - ./monitoring/grafana/datasources:/etc/grafana/provisioning/datasources
    networks:
      - datban-network

  zipkin:
    image: openzipkin/zipkin:2.24
    ports:
      - "9411:9411"
    environment:
      STORAGE_TYPE: mem
    networks:
      - datban-network

volumes:
  postgres_users_data:
  postgres_reservations_data:
  postgres_payments_data:
  mongodb_data:
  redis_data:
  rabbitmq_data:
  prometheus_data:
  grafana_data:

networks:
  datban-network:
    driver: bridge
```

## 🎯 Best Practices Preserved

### 1. Clean Architecture (Onion Architecture)

- **Core Domain Layer**: Pure business logic, entities, and use cases
- **Application Layer**: Controllers, handlers, and adapters
- **Infrastructure Layer**: Database, messaging, external service implementations
- **Presentation Layer**: DTOs, validators, and API contracts

### 2. Domain-Driven Design (DDD)

- **Bounded Contexts**: Each microservice represents a clear business domain
- **Aggregates**: Proper aggregate roots and consistency boundaries
- **Domain Events**: Rich domain events for cross-service communication
- **Value Objects**: Immutable value objects for domain concepts

### 3. Ports and Adapters Pattern

- **Ports**: Interfaces defining how the core interacts with external world
- **Adapters**: Concrete implementations of ports for specific technologies
- **Dependency Inversion**: Core depends on abstractions, not concretions

### 4. 100% Test Coverage Strategy

- **Unit Tests**: Domain logic and use cases
- **Integration Tests**: Database, messaging, and external service interactions
- **Contract Tests**: gRPC and event schema validation
- **End-to-End Tests**: Complete business workflows

### 5. Observability Excellence

- **Distributed Tracing**: OpenTelemetry across all services
- **Metrics**: Custom business metrics with Prometheus
- **Logging**: Structured logging with correlation IDs
- **Health Checks**: Comprehensive health monitoring

## 📋 Sample Implementation Files

### User Service - Core Entity

```typescript
// apps/user-service/src/core/entities/user.entity.ts
import { AggregateRoot } from "@nestjs/cqrs";
import { UserCreated, UserUpdated } from "../events";

export class User extends AggregateRoot {
  constructor(
    public readonly id: string,
    public email: string,
    public name: string,
    public phone?: string,
    public preferences?: UserPreferences,
    public createdAt?: Date,
    public updatedAt?: Date
  ) {
    super();
  }

  static create(data: {
    email: string;
    name: string;
    phone?: string;
    preferences?: UserPreferences;
  }): User {
    const user = new User(
      generateId(),
      data.email,
      data.name,
      data.phone,
      data.preferences,
      new Date(),
      new Date()
    );

    user.apply(
      new UserCreated({
        userId: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        preferences: user.preferences,
      })
    );

    return user;
  }

  updateProfile(updates: Partial<UserProfile>): void {
    const previousData = {
      email: this.email,
      name: this.name,
      phone: this.phone,
      preferences: this.preferences,
    };

    Object.assign(this, updates);
    this.updatedAt = new Date();

    this.apply(
      new UserUpdated({
        userId: this.id,
        previousData,
        updatedData: updates,
      })
    );
  }
}

export interface UserPreferences {
  cuisineTypes: string[];
  dietaryRestrictions: string[];
  notificationSettings: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  defaultPartySize: number;
}
```

### Repository Port and Adapter

```typescript
// apps/user-service/src/core/repositories/user.repository.port.ts
export abstract class UserRepositoryPort {
  abstract save(user: User): Promise<void>;
  abstract findById(id: string): Promise<User | null>;
  abstract findByEmail(email: string): Promise<User | null>;
  abstract delete(id: string): Promise<void>;
  abstract findMany(
    criteria: UserSearchCriteria
  ): Promise<PaginatedResult<User>>;
}

// apps/user-service/src/infrastructure/repositories/user.repository.adapter.ts
@Injectable()
export class UserRepositoryAdapter implements UserRepositoryPort {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly mapper: UserMapper
  ) {}

  async save(user: User): Promise<void> {
    const entity = this.mapper.toEntity(user);
    await this.userRepository.save(entity);
  }

  async findById(id: string): Promise<User | null> {
    const entity = await this.userRepository.findOne({ where: { id } });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const entity = await this.userRepository.findOne({ where: { email } });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async delete(id: string): Promise<void> {
    await this.userRepository.softDelete(id);
  }

  async findMany(criteria: UserSearchCriteria): Promise<PaginatedResult<User>> {
    const queryBuilder = this.userRepository.createQueryBuilder("user");

    if (criteria.name) {
      queryBuilder.andWhere("user.name ILIKE :name", {
        name: `%${criteria.name}%`,
      });
    }

    if (criteria.email) {
      queryBuilder.andWhere("user.email ILIKE :email", {
        email: `%${criteria.email}%`,
      });
    }

    const [entities, total] = await queryBuilder
      .skip((criteria.page - 1) * criteria.limit)
      .take(criteria.limit)
      .getManyAndCount();

    const users = entities.map((entity) => this.mapper.toDomain(entity));

    return {
      data: users,
      total,
      page: criteria.page,
      limit: criteria.limit,
      totalPages: Math.ceil(total / criteria.limit),
    };
  }
}
```

### Use Case Implementation

```typescript
// apps/user-service/src/core/use-cases/create-user.use-case.ts
@Injectable()
export class CreateUserUseCase {
  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly eventBus: EventBus,
    private readonly passwordHasher: PasswordHasherPort,
    private readonly logger: LoggerService
  ) {}

  async execute(command: CreateUserCommand): Promise<CreateUserResult> {
    // Validate business rules
    await this.validateUniqueEmail(command.email);

    // Hash password
    const hashedPassword = await this.passwordHasher.hash(command.password);

    // Create domain entity
    const user = User.create({
      email: command.email,
      name: command.name,
      phone: command.phone,
      preferences: command.preferences,
    });

    // Save to repository
    await this.userRepository.save(user);

    // Publish domain events
    user.getUncommittedEvents().forEach((event) => {
      this.eventBus.publish(event);
    });
    user.markEventsAsCommitted();

    this.logger.log(`User created: ${user.id}`, "CreateUserUseCase");

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
      },
      success: true,
    };
  }

  private async validateUniqueEmail(email: string): Promise<void> {
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictException("User with this email already exists");
    }
  }
}
```

### Event Publisher and Consumer

```typescript
// apps/user-service/src/infrastructure/messaging/event-publisher.adapter.ts
@Injectable()
export class EventPublisherAdapter implements EventPublisherPort {
  constructor(
    @Inject("RABBITMQ_SERVICE")
    private readonly rabbitMQService: ClientProxy,
    private readonly logger: LoggerService
  ) {}

  async publish(event: DomainEvent): Promise<void> {
    try {
      const pattern = this.getRoutingKey(event);
      await this.rabbitMQService.emit(pattern, event).toPromise();

      this.logger.log(`Event published: ${event.eventType}`, "EventPublisher");
    } catch (error) {
      this.logger.error(`Failed to publish event: ${event.eventType}`, error);
      throw error;
    }
  }

  private getRoutingKey(event: DomainEvent): string {
    const [domain, action] = event.eventType.split(".");
    return `${domain}.${action}`;
  }
}

// apps/reservation-service/src/infrastructure/messaging/event-consumer.ts
@Controller()
export class ReservationEventConsumer {
  constructor(
    private readonly updateUserStatsUseCase: UpdateUserStatsUseCase,
    private readonly logger: LoggerService
  ) {}

  @EventPattern("user.created")
  async handleUserCreated(@Payload() event: UserCreated): Promise<void> {
    try {
      await this.updateUserStatsUseCase.execute({
        userId: event.userId,
        action: "user_registered",
      });

      this.logger.log(`Processed UserCreated event for: ${event.userId}`);
    } catch (error) {
      this.logger.error(`Failed to process UserCreated event`, error);
      // Implement dead letter queue handling
      throw error;
    }
  }

  @EventPattern("payment.processed")
  async handlePaymentProcessed(
    @Payload() event: PaymentProcessed
  ): Promise<void> {
    try {
      if (event.status === "completed") {
        await this.confirmReservationUseCase.execute({
          reservationId: event.reservationId,
          paymentId: event.paymentId,
        });
      } else if (event.status === "failed") {
        await this.cancelReservationUseCase.execute({
          reservationId: event.reservationId,
          reason: "payment_failed",
        });
      }
    } catch (error) {
      this.logger.error(`Failed to process PaymentProcessed event`, error);
      throw error;
    }
  }
}
```

### gRPC Service Implementation

```typescript
// apps/user-service/src/infrastructure/grpc/user.grpc.service.ts
import { Controller } from "@nestjs/common";
import { GrpcMethod } from "@nestjs/microservices";

@Controller()
export class UserGrpcService {
  constructor(
    private readonly getUserUseCase: GetUserUseCase,
    private readonly validateUserUseCase: ValidateUserUseCase
  ) {}

  @GrpcMethod("UserService", "GetUser")
  async getUser(data: GetUserRequest): Promise<GetUserResponse> {
    const result = await this.getUserUseCase.execute({ userId: data.userId });

    if (!result.user) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: "User not found",
      });
    }

    return {
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        phone: result.user.phone || "",
        preferences: result.user.preferences || null,
      },
    };
  }

  @GrpcMethod("UserService", "ValidateUser")
  async validateUser(data: ValidateUserRequest): Promise<ValidateUserResponse> {
    const result = await this.validateUserUseCase.execute({
      userId: data.userId,
      permissions: data.permissions,
    });

    return {
      isValid: result.isValid,
      permissions: result.permissions,
    };
  }
}

// apps/reservation-service/src/infrastructure/grpc/user.grpc.client.ts
@Injectable()
export class UserGrpcClient {
  private userService: UserServiceClient;

  constructor(@Inject("USER_GRPC_PACKAGE") private client: ClientGrpc) {}

  onModuleInit() {
    this.userService = this.client.getService<UserServiceClient>("UserService");
  }

  async getUser(userId: string): Promise<User> {
    try {
      const response = await firstValueFrom(
        this.userService.getUser({ userId })
      );
      return response.user;
    } catch (error) {
      if (error.code === status.NOT_FOUND) {
        throw new NotFoundException(`User ${userId} not found`);
      }
      throw new InternalServerErrorException("Failed to fetch user data");
    }
  }

  async validateUser(userId: string, permissions: string[]): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.userService.validateUser({ userId, permissions })
      );
      return response.isValid;
    } catch (error) {
      this.logger.error(`Failed to validate user ${userId}`, error);
      return false;
    }
  }
}
```

### Restaurant Service - MongoDB Implementation

```typescript
// apps/restaurant-service/src/core/entities/restaurant.entity.ts
export class Restaurant extends AggregateRoot {
  constructor(
    public readonly id: string,
    public name: string,
    public description: string,
    public location: Location,
    public capacity: number,
    public cuisine: string[],
    public priceRange: PriceRange,
    public hours: OperatingHours,
    public menu: Menu,
    public availability: Availability[],
    public rating: Rating,
    public createdAt?: Date,
    public updatedAt?: Date,
  ) {
    super();
  }

  static create(data: CreateRestaurantData): Restaurant {
    const restaurant = new Restaurant(
      new ObjectId().toString(),
      data.name,
      data.description,
      data.location,
      data.capacity,
      data.cuisine,
      data.priceRange,
      data.hours,
      data.menu,
      [],
      { average: 0, totalReviews: 0 },
      new Date(),
      new Date(),
    );

    restaurant.apply(new RestaurantCreated({
      restaurantId: restaurant.id,
      name: restaurant.name,
      location: restaurant.location,
      capacity: restaurant.capacity,
      cuisine: restaurant.cuisine,
    }));

    return restaurant;
  }

  updateAvailability(date: Date, timeSlots: TimeSlot[]): void {
    const existingIndex = this.availability.findIndex(
      a => a.date.toDateString() === date.toDateString()
    );

    if (existingIndex >= 0) {
      this.availability[existingIndex].timeSlots = timeSlots;
    } else {
      this.availability.push({ date, timeSlots });
    }

    this.updatedAt = new Date();

    this.apply(new AvailabilityChanged({
      restaurantId: this.id,
      date,
      timeSlots,
    }));
  }

  reserveSlot(date: Date, time: string, partySize: number): boolean {
    const availability = this.availability.find(
      a => a.date.toDateString() === date.toDateString()
    );

    if (!availability) {
      return false;
    }

    const timeSlot = availability.timeSlots.find(ts => ts.time === time);
    if (!timeSlot || timeSlot.availableSpots < partySize) {
      return false;
    }

    timeSlot.availableSpots -= partySize;
    this.updatedAt = new Date();

    return true;
  }
}

// MongoDB Schema
// apps/restaurant-service/src/infrastructure/database/schemas/restaurant.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class RestaurantDocument extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({
    type: {
      address: String,
      coordinates: [Number],
      city: String,
      zipCode: String,
    },
    required: true,
  })
  location: {
    address: string;
    coordinates: [number, number];
    city: string;
    zipCode: string;
  };

  @Prop({ required: true })
  capacity: number;

  @Prop([String])
  cuisine: string[];

  @Prop({ enum: [', '$', '$, '$$'] })
  priceRange: string;

  @Prop({
    type: Map,
    of: {
      open: String,
      close: String,
    },
  })
  hours: Map<string, { open: string; close: string }>;

  @Prop([{
    category: String,
    items: [{
      name: String,
      description: String,
      price: Number,
      allergens: [String],
    }],
  }])
  menu: {
    category: string;
    items: {
      name: string;
      description: string;
      price: number;
      allergens: string[];
    }[];
  }[];

  @Prop([{
    date: Date,
    timeSlots: [{
      time: String,
      availableSpots: Number,
      totalSpots: Number,
    }],
  }])
  availability: {
    date: Date;
    timeSlots: {
      time: string;
      availableSpots: number;
      totalSpots: number;
    }[];
  }[];

  @Prop({
    average: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
  })
  rating: {
    average: number;
    totalReviews: number;
  };
}

export const RestaurantSchema = SchemaFactory.createForClass(RestaurantDocument);

// Create indexes
RestaurantSchema.index({ 'location.coordinates': '2dsphere' });
RestaurantSchema.index({ cuisine: 1 });
RestaurantSchema.index({ priceRange: 1 });
RestaurantSchema.index({ 'rating.average': -1 });
RestaurantSchema.index({ 'availability.date': 1 });
```

### Comprehensive Testing Examples

```typescript
// Integration Test with Testcontainers
// apps/reservation-service/test/integration/reservation.integration.spec.ts
describe("Reservation Service Integration", () => {
  let app: INestApplication;
  let postgresContainer: StartedPostgreSqlContainer;
  let rabbitMQContainer: StartedGenericContainer;
  let reservationRepository: ReservationRepositoryPort;
  let eventPublisher: EventPublisherPort;

  beforeAll(async () => {
    // Start test containers
    postgresContainer = await new PostgreSqlContainer()
      .withDatabase("test_reservations")
      .withUsername("test")
      .withPassword("test")
      .start();

    rabbitMQContainer = await new GenericContainer("rabbitmq:3-management")
      .withExposedPorts(5672, 15672)
      .withEnvironment({
        RABBITMQ_DEFAULT_USER: "test",
        RABBITMQ_DEFAULT_PASS: "test",
      })
      .start();

    // Create test module
    const moduleBuilder = Test.createTestingModule({
      imports: [
        ReservationModule,
        TypeOrmModule.forRoot({
          type: "postgres",
          host: postgresContainer.getHost(),
          port: postgresContainer.getPort(),
          username: postgresContainer.getUsername(),
          password: postgresContainer.getPassword(),
          database: postgresContainer.getDatabase(),
          entities: [ReservationEntity],
          synchronize: true,
        }),
        ClientsModule.register([
          {
            name: "RABBITMQ_SERVICE",
            transport: Transport.RMQ,
            options: {
              urls: [
                `amqp://test:test@${rabbitMQContainer.getHost()}:${rabbitMQContainer.getPort()}`,
              ],
              queue: "test_queue",
            },
          },
        ]),
      ],
    });

    const module = await moduleBuilder.compile();
    app = module.createNestApplication();

    reservationRepository = module.get<ReservationRepositoryPort>(
      "ReservationRepositoryPort"
    );
    eventPublisher = module.get<EventPublisherPort>("EventPublisherPort");

    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await postgresContainer.stop();
    await rabbitMQContainer.stop();
  });

  describe("Create Reservation", () => {
    it("should create reservation and publish event", async () => {
      // Given
      const createReservationDto: CreateReservationDto = {
        userId: "user-123",
        restaurantId: "restaurant-456",
        dateTime: new Date("2024-12-25T19:00:00Z"),
        partySize: 4,
        specialRequests: "Window table preferred",
      };

      // When
      const response = await request(app.getHttpServer())
        .post("/api/v1/reservations")
        .send(createReservationDto)
        .expect(201);

      // Then
      expect(response.body.reservation).toBeDefined();
      expect(response.body.reservation.status).toBe("pending");
      expect(response.body.reservation.confirmationCode).toBeDefined();

      // Verify database persistence
      const savedReservation = await reservationRepository.findById(
        response.body.reservation.id
      );
      expect(savedReservation).toBeDefined();
      expect(savedReservation.userId).toBe(createReservationDto.userId);

      // Verify event publication (you'd need to set up event capturing)
      // This would typically involve a test event handler
    });

    it("should handle concurrent reservations correctly", async () => {
      // Test for race conditions and proper locking
      const reservationPromises = Array.from({ length: 5 }, (_, i) =>
        request(app.getHttpServer())
          .post("/api/v1/reservations")
          .send({
            userId: `user-${i}`,
            restaurantId: "restaurant-limited",
            dateTime: new Date("2024-12-25T20:00:00Z"),
            partySize: 2,
          })
      );

      const results = await Promise.allSettled(reservationPromises);

      // Only some should succeed based on restaurant capacity
      const successful = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;

      expect(successful).toBeLessThan(5); // Some should fail due to capacity
      expect(failed).toBeGreaterThan(0);
    });
  });
});

// Contract Testing for gRPC
// apps/user-service/test/contracts/user.grpc.contract.spec.ts
describe("User gRPC Service Contract", () => {
  let grpcClient: UserServiceClient;

  beforeAll(async () => {
    // Setup gRPC client for testing
    grpcClient = new UserServiceClient(
      "localhost:50051",
      grpc.credentials.createInsecure()
    );
  });

  it("should return user data with correct schema", (done) => {
    grpcClient.getUser({ userId: "valid-user-id" }, (error, response) => {
      expect(error).toBeNull();
      expect(response).toMatchObject({
        user: {
          id: expect.any(String),
          email: expect.stringMatching(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
          name: expect.any(String),
          phone: expect.any(String),
          preferences: expect.objectContaining({
            cuisineTypes: expect.arrayContaining([expect.any(String)]),
            dietaryRestrictions: expect.arrayContaining([expect.any(String)]),
            notificationSettings: expect.objectContaining({
              email: expect.any(Boolean),
              sms: expect.any(Boolean),
              push: expect.any(Boolean),
            }),
          }),
        },
      });
      done();
    });
  });

  it("should handle not found error correctly", (done) => {
    grpcClient.getUser({ userId: "non-existent-user" }, (error, response) => {
      expect(error).toBeDefined();
      expect(error.code).toBe(grpc.status.NOT_FOUND);
      expect(error.message).toContain("User not found");
      done();
    });
  });
});

// Load Testing Example
// apps/reservation-service/test/load/reservation.load.spec.ts
describe("Reservation Service Load Tests", () => {
  it("should handle high concurrent reservation requests", async () => {
    const concurrentUsers = 100;
    const reservationsPerUser = 10;

    const startTime = Date.now();

    const promises = Array.from(
      { length: concurrentUsers },
      async (_, userIndex) => {
        const userReservations = Array.from(
          { length: reservationsPerUser },
          (_, reservationIndex) =>
            request(app.getHttpServer())
              .post("/api/v1/reservations")
              .send({
                userId: `load-test-user-${userIndex}`,
                restaurantId: "load-test-restaurant",
                dateTime: new Date(
                  Date.now() + reservationIndex * 24 * 60 * 60 * 1000
                ),
                partySize: Math.floor(Math.random() * 6) + 1,
              })
        );

        return Promise.allSettled(userReservations);
      }
    );

    const results = await Promise.all(promises);
    const endTime = Date.now();

    const totalRequests = concurrentUsers * reservationsPerUser;
    const successfulRequests = results
      .flat()
      .filter((result) => result.status === "fulfilled").length;
    const duration = endTime - startTime;
    const requestsPerSecond = totalRequests / (duration / 1000);

    expect(successfulRequests).toBeGreaterThan(totalRequests * 0.95); // 95% success rate
    expect(requestsPerSecond).toBeGreaterThan(50); // At least 50 RPS
    expect(duration).toBeLessThan(30000); // Complete within 30 seconds
  });
});
```

## 🚀 Deployment and CI/CD

### GitHub Actions Workflow

```yaml
# .github/workflows/microservices.yml
name: DatBan Microservices CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        service:
          [
            user-service,
            restaurant-service,
            reservation-service,
            payment-service,
            notification-service,
            analytics-service,
          ]

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run linting
        run: npm run lint:${{ matrix.service }}

      - name: Run unit tests
        run: npm run test:${{ matrix.service }}

      - name: Run integration tests
        run: npm run test:integration:${{ matrix.service }}
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test_db
          RABBITMQ_URL: amqp://test:test@localhost:5672

      - name: Generate test coverage
        run: npm run test:coverage:${{ matrix.service }}

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ./apps/${{ matrix.service }}/coverage/lcov.info
          flags: ${{ matrix.service }}

  build:
    needs: test
    runs-on: ubuntu-latest
    strategy:
      matrix:
        service:
          [
            user-service,
            restaurant-service,
            reservation-service,
            payment-service,
            notification-service,
            analytics-service,
          ]

    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: ./apps/${{ matrix.service }}
          push: true
          tags: |
            ghcr.io/${{ github.repository }}/datban-${{ matrix.service }}:${{ github.sha }}
            ghcr.io/${{ github.repository }}/datban-${{ matrix.service }}:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Kubernetes
        run: |
          # Update Kubernetes manifests with new image tags
          sed -i "s/IMAGE_TAG/${{ github.sha }}/g" k8s/*.yaml
          kubectl apply -f k8s/
        env:
          KUBECONFIG: ${{ secrets.KUBECONFIG }}
```

### Kubernetes Deployment

```yaml
# k8s/user-service.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: user-service
  namespace: datban
spec:
  replicas: 3
  selector:
    matchLabels:
      app: user-service
  template:
    metadata:
      labels:
        app: user-service
    spec:
      containers:
        - name: user-service
          image: ghcr.io/your-org/datban-user-service:IMAGE_TAG
          ports:
            - containerPort: 3001
            - containerPort: 50051
          env:
            - name: NODE_ENV
              value: "production"
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: postgres-credentials
                  key: user-service-url
            - name: RABBITMQ_URL
              valueFrom:
                secretKeyRef:
                  name: rabbitmq-credentials
                  key: connection-url
            - name: REDIS_URL
              valueFrom:
                secretKeyRef:
                  name: redis-credentials
                  key: connection-url
          livenessProbe:
            httpGet:
              path: /health
              port: 3001
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /health/ready
              port: 3001
            initialDelaySeconds: 5
            periodSeconds: 5
          resources:
            requests:
              memory: "256Mi"
              cpu: "250m"
            limits:
              memory: "512Mi"
              cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: user-service
  namespace: datban
spec:
  selector:
    app: user-service
  ports:
    - name: http
      port: 3001
      targetPort: 3001
    - name: grpc
      port: 50051
      targetPort: 50051
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: user-service-ingress
  namespace: datban
  annotations:
    kubernetes.io/ingress.class: "kong"
    konghq.com/plugins: rate-limiting-plugin,jwt-plugin
spec:
  rules:
    - host: api.datban.com
      http:
        paths:
          - path: /api/v1/users
            pathType: Prefix
            backend:
              service:
                name: user-service
                port:
                  number: 3001
```

## 📈 Performance and Scalability Considerations

### Database Optimization

````# DatBan Restaurant Reservation System - Complete Implementation

## 📈 Performance and Scalability Considerations

### Database Optimization Strategies

#### PostgreSQL Optimization (User, Reservation, Payment Services)
```sql
-- Performance indexes for User Service
CREATE INDEX CONCURRENTLY idx_users_email_hash ON users USING hash(email);
CREATE INDEX CONCURRENTLY idx_users_phone_partial ON users(phone) WHERE phone IS NOT NULL;
CREATE INDEX CONCURRENTLY idx_users_created_at_desc ON users(created_at DESC);

-- Reservation Service - Compound indexes for common queries
CREATE INDEX CONCURRENTLY idx_reservations_user_date ON reservations(user_id, reservation_date DESC);
CREATE INDEX CONCURRENTLY idx_reservations_restaurant_date_status ON reservations(restaurant_id, reservation_date, status);
CREATE INDEX CONCURRENTLY idx_reservations_date_time_status ON reservations(reservation_date, reservation_time, status)
  WHERE status IN ('confirmed', 'pending');

-- Payment Service - Optimized for financial queries
CREATE INDEX CONCURRENTLY idx_payments_user_created ON payments(user_id, created_at DESC);
CREATE INDEX CONCURRENTLY idx_payments_status_processed ON payments(status, processed_at DESC);
CREATE INDEX CONCURRENTLY idx_payments_provider_transaction ON payments(payment_provider, provider_transaction_id);

-- Partitioning for large tables
CREATE TABLE reservations_2024 PARTITION OF reservations
  FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
CREATE TABLE reservations_2025 PARTITION OF reservations
  FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');

-- Connection pooling configuration
-- postgresql.conf optimization
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB
max_connections = 200
````

#### MongoDB Optimization (Restaurant, Analytics Services)

```javascript
// Restaurant Service - Geospatial and performance indexes
db.restaurants.createIndex({ "location.coordinates": "2dsphere" });
db.restaurants.createIndex({ cuisine: 1, priceRange: 1 });
db.restaurants.createIndex({ "rating.average": -1, "location.city": 1 });
db.restaurants.createIndex({
  "availability.date": 1,
  "availability.timeSlots.time": 1,
});

// Compound index for availability searches
db.restaurants.createIndex({
  "location.coordinates": "2dsphere",
  cuisine: 1,
  "availability.date": 1,
});

// Analytics Service - Time-series optimized indexes
db.events.createIndex({ timestamp: -1, eventType: 1 });
db.events.createIndex({ aggregateId: 1, timestamp: -1 });
db.events.createIndex({ eventType: 1, timestamp: -1 });

// Aggregation pipeline optimization
db.restaurants.aggregate([
  {
    $match: {
      "location.coordinates": {
        $near: {
          $geometry: { type: "Point", coordinates: [lng, lat] },
          $maxDistance: 5000,
        },
      },
      cuisine: { $in: preferredCuisines },
    },
  },
  {
    $lookup: {
      from: "availability",
      localField: "_id",
      foreignField: "restaurantId",
      as: "availableSlots",
    },
  },
  { $limit: 20 },
]);
```

#### Redis Optimization (Notification Service + Caching)

```typescript
// apps/libs/common/cache/redis-cache.service.ts
@Injectable()
export class RedisCacheService implements CacheServicePort {
  constructor(@Inject("REDIS_CLIENT") private readonly redis: Redis) {}

  // Caching strategies for different data types
  async cacheRestaurantAvailability(
    restaurantId: string,
    date: string,
    availability: TimeSlot[],
    ttl: number = 1800 // 30 minutes
  ): Promise<void> {
    const key = `restaurant:${restaurantId}:availability:${date}`;
    await this.redis.setex(key, ttl, JSON.stringify(availability));
  }

  async getCachedAvailability(
    restaurantId: string,
    date: string
  ): Promise<TimeSlot[] | null> {
    const key = `restaurant:${restaurantId}:availability:${date}`;
    const cached = await this.redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  // User session caching
  async cacheUserSession(
    userId: string,
    sessionData: UserSession,
    ttl: number = 3600
  ): Promise<void> {
    const key = `session:${userId}`;
    await this.redis.hset(key, sessionData);
    await this.redis.expire(key, ttl);
  }

  // Distributed locking for concurrent operations
  async acquireLock(lockKey: string, ttl: number = 30): Promise<string | null> {
    const lockValue = uuidv4();
    const result = await this.redis.set(
      `lock:${lockKey}`,
      lockValue,
      "PX",
      ttl * 1000,
      "NX"
    );
    return result === "OK" ? lockValue : null;
  }

  async releaseLock(lockKey: string, lockValue: string): Promise<boolean> {
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;
    const result = await this.redis.eval(
      script,
      1,
      `lock:${lockKey}`,
      lockValue
    );
    return result === 1;
  }

  // Rate limiting implementation
  async checkRateLimit(
    identifier: string,
    limit: number,
    windowSizeMs: number
  ): Promise<boolean> {
    const key = `rate_limit:${identifier}`;
    const now = Date.now();
    const windowStart = now - windowSizeMs;

    const pipeline = this.redis.pipeline();
    pipeline.zremrangebyscore(key, 0, windowStart);
    pipeline.zcard(key);
    pipeline.zadd(key, now, now);
    pipeline.expire(key, Math.ceil(windowSizeMs / 1000));

    const results = await pipeline.exec();
    const currentCount = results[1][1] as number;

    return currentCount < limit;
  }
}
```

### API Gateway Performance Configuration

#### Kong Gateway Optimization

```yaml
# infrastructure/kong/kong-performance.yml
_format_version: "3.0"

# Global plugins for performance
plugins:
  - name: response-transformer
    config:
      remove:
        headers: ["X-Powered-By", "Server"]

  - name: gzip
    config:
      types:
        - "application/json"
        - "text/plain"
        - "text/html"

  - name: rate-limiting
    config:
      minute: 1000
      hour: 10000
      redis_host: redis
      redis_port: 6379
      policy: redis

  - name: request-size-limiting
    config:
      allowed_payload_size: 1

services:
  - name: user-service
    url: http://user-service:3001
    connect_timeout: 5000
    write_timeout: 10000
    read_timeout: 10000
    retries: 3
    plugins:
      - name: prometheus
        config:
          per_consumer: true

      - name: correlation-id
        config:
          header_name: X-Correlation-ID
          generator: uuid#counter

      - name: response-ratelimiting
        config:
          limits:
            video:
              minute: 10
            image:
              minute: 20

# Load balancing configuration
upstreams:
  - name: user-service-upstream
    algorithm: least-connections
    healthchecks:
      active:
        http_path: "/health"
        healthy:
          interval: 10
          successes: 3
        unhealthy:
          interval: 10
          http_failures: 3
      passive:
        healthy:
          successes: 3
        unhealthy:
          http_failures: 3
    targets:
      - target: user-service-1:3001
        weight: 100
      - target: user-service-2:3001
        weight: 100
      - target: user-service-3:3001
        weight: 100
```

### Microservice Performance Patterns

#### Circuit Breaker Implementation

```typescript
// apps/libs/common/resilience/circuit-breaker.service.ts
import { Injectable } from "@nestjs/common";

export enum CircuitBreakerState {
  CLOSED = "CLOSED",
  OPEN = "OPEN",
  HALF_OPEN = "HALF_OPEN",
}

@Injectable()
export class CircuitBreakerService {
  private circuits = new Map<string, CircuitBreakerConfig>();

  async executeWithCircuitBreaker<T>(
    circuitName: string,
    operation: () => Promise<T>,
    config: CircuitBreakerOptions = {}
  ): Promise<T> {
    const circuit = this.getOrCreateCircuit(circuitName, config);

    if (circuit.state === CircuitBreakerState.OPEN) {
      if (Date.now() - circuit.lastFailureTime < circuit.timeout) {
        throw new ServiceUnavailableException(
          `Circuit breaker is OPEN for ${circuitName}`
        );
      }
      circuit.state = CircuitBreakerState.HALF_OPEN;
    }

    try {
      const result = await Promise.race([
        operation(),
        this.timeoutPromise(config.timeout || 5000),
      ]);

      // Success - reset failure count
      if (circuit.state === CircuitBreakerState.HALF_OPEN) {
        circuit.state = CircuitBreakerState.CLOSED;
      }
      circuit.failureCount = 0;

      return result;
    } catch (error) {
      circuit.failureCount++;
      circuit.lastFailureTime = Date.now();

      if (circuit.failureCount >= circuit.failureThreshold) {
        circuit.state = CircuitBreakerState.OPEN;
      }

      throw error;
    }
  }

  private getOrCreateCircuit(
    name: string,
    options: CircuitBreakerOptions
  ): CircuitBreakerConfig {
    if (!this.circuits.has(name)) {
      this.circuits.set(name, {
        state: CircuitBreakerState.CLOSED,
        failureCount: 0,
        failureThreshold: options.failureThreshold || 5,
        timeout: options.timeout || 30000,
        lastFailureTime: 0,
      });
    }
    return this.circuits.get(name)!;
  }

  private timeoutPromise<T>(ms: number): Promise<T> {
    return new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Operation timed out")), ms)
    );
  }
}

// Usage in service
@Injectable()
export class ReservationService {
  constructor(
    private readonly circuitBreaker: CircuitBreakerService,
    private readonly userGrpcClient: UserGrpcClient,
    private readonly restaurantGrpcClient: RestaurantGrpcClient
  ) {}

  async createReservation(data: CreateReservationDto): Promise<Reservation> {
    // Use circuit breaker for external service calls
    const user = await this.circuitBreaker.executeWithCircuitBreaker(
      "user-service",
      () => this.userGrpcClient.getUser(data.userId),
      { failureThreshold: 3, timeout: 5000 }
    );

    const restaurant = await this.circuitBreaker.executeWithCircuitBreaker(
      "restaurant-service",
      () => this.restaurantGrpcClient.getRestaurant(data.restaurantId),
      { failureThreshold: 3, timeout: 5000 }
    );

    // Create reservation logic...
    return this.processReservation(user, restaurant, data);
  }
}
```

#### Async Processing with Bull Queue

```typescript
// apps/libs/common/queue/bull-queue.service.ts
import { Injectable } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bull";

@Injectable()
export class NotificationQueueService {
  constructor(
    @InjectQueue("notifications") private notificationQueue: Queue,
    @InjectQueue("emails") private emailQueue: Queue
  ) {}

  async sendReservationConfirmation(data: {
    userId: string;
    reservationId: string;
    restaurantName: string;
    dateTime: Date;
  }): Promise<void> {
    // Add to high priority queue
    await this.emailQueue.add("reservation-confirmation", data, {
      priority: 10,
      delay: 0,
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
    });
  }

  async scheduleReservationReminder(data: {
    userId: string;
    reservationId: string;
    reminderTime: Date;
  }): Promise<void> {
    const delay = data.reminderTime.getTime() - Date.now();

    await this.notificationQueue.add("reservation-reminder", data, {
      delay,
      attempts: 2,
      removeOnComplete: true,
    });
  }

  async processBulkAnalytics(events: DomainEvent[]): Promise<void> {
    // Batch processing for analytics
    const chunks = this.chunkArray(events, 100);

    for (const chunk of chunks) {
      await this.analyticsQueue.add("process-events-batch", chunk, {
        priority: 1,
        attempts: 1,
      });
    }
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}

// Queue processors
// apps/notification-service/src/infrastructure/processors/email.processor.ts
import { Process, Processor } from "@nestjs/bull";
import { Job } from "bull";

@Processor("emails")
export class EmailProcessor {
  constructor(
    private readonly emailService: EmailService,
    private readonly templateService: TemplateService
  ) {}

  @Process("reservation-confirmation")
  async processReservationConfirmation(job: Job<ReservationConfirmationData>) {
    const { userId, reservationId, restaurantName, dateTime } = job.data;

    try {
      const template = await this.templateService.getTemplate(
        "reservation-confirmation"
      );
      const htmlContent = await this.templateService.render(template, {
        restaurantName,
        dateTime: dateTime.toLocaleDateString(),
        confirmationUrl: `${process.env.FRONTEND_URL}/reservations/${reservationId}`,
      });

      await this.emailService.sendEmail({
        to: await this.getUserEmail(userId),
        subject: `Reservation Confirmed - ${restaurantName}`,
        html: htmlContent,
      });

      job.progress(100);
    } catch (error) {
      throw new Error(`Failed to send confirmation email: ${error.message}`);
    }
  }

  @Process("reservation-reminder")
  async processReservationReminder(job: Job<ReservationReminderData>) {
    // 24-hour reminder implementation
    const { userId, reservationId } = job.data;

    // Get reservation details and send reminder
    await this.sendReminderNotification(userId, reservationId);
  }
}
```

## 🔒 Security Implementation

### Authentication & Authorization Framework

#### JWT Service with Refresh Tokens

```typescript
// apps/libs/common/auth/jwt-auth.service.ts
@Injectable()
export class JwtAuthService {
  constructor(
    @Inject("JWT_CONFIG") private jwtConfig: JwtConfig,
    private readonly redis: Redis,
    private readonly logger: LoggerService
  ) {}

  async generateTokenPair(payload: JwtPayload): Promise<TokenPair> {
    const accessToken = this.jwtService.sign(payload, {
      secret: this.jwtConfig.accessTokenSecret,
      expiresIn: this.jwtConfig.accessTokenExpiry, // 15 minutes
    });

    const refreshToken = this.jwtService.sign(
      { sub: payload.sub, tokenType: "refresh" },
      {
        secret: this.jwtConfig.refreshTokenSecret,
        expiresIn: this.jwtConfig.refreshTokenExpiry, // 7 days
      }
    );

    // Store refresh token in Redis with expiry
    await this.redis.setex(
      `refresh_token:${payload.sub}`,
      this.jwtConfig.refreshTokenExpiry,
      refreshToken
    );

    return { accessToken, refreshToken };
  }

  async refreshAccessToken(refreshToken: string): Promise<string> {
    try {
      const decoded = this.jwtService.verify(refreshToken, {
        secret: this.jwtConfig.refreshTokenSecret,
      });

      // Verify refresh token exists in Redis
      const storedToken = await this.redis.get(`refresh_token:${decoded.sub}`);
      if (storedToken !== refreshToken) {
        throw new UnauthorizedException("Invalid refresh token");
      }

      // Generate new access token
      const newPayload = await this.getUserPayload(decoded.sub);
      const newAccessToken = this.jwtService.sign(newPayload, {
        secret: this.jwtConfig.accessTokenSecret,
        expiresIn: this.jwtConfig.accessTokenExpiry,
      });

      return newAccessToken;
    } catch (error) {
      throw new UnauthorizedException("Invalid refresh token");
    }
  }

  async revokeRefreshToken(userId: string): Promise<void> {
    await this.redis.del(`refresh_token:${userId}`);
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    // Add access token to blacklist
    const blacklistKey = `blacklist:${userId}`;
    await this.redis.sadd(blacklistKey, Date.now().toString());
    await this.redis.expire(blacklistKey, this.jwtConfig.accessTokenExpiry);

    // Remove refresh token
    await this.revokeRefreshToken(userId);
  }

  async isTokenBlacklisted(
    userId: string,
    tokenIssuedAt: number
  ): Promise<boolean> {
    const blacklistKey = `blacklist:${userId}`;
    const blacklistEntries = await this.redis.smembers(blacklistKey);

    return blacklistEntries.some(
      (entry) => parseInt(entry) > tokenIssuedAt * 1000
    );
  }
}
```

#### Role-Based Access Control (RBAC)

```typescript
// apps/libs/common/auth/rbac.service.ts
@Injectable()
export class RbacService {
  private readonly roleHierarchy = new Map([
    ["admin", ["manager", "user", "guest"]],
    ["manager", ["user", "guest"]],
    ["user", ["guest"]],
    ["guest", []],
  ]);

  private readonly permissions = new Map([
    // User permissions
    ["user:read", ["user", "manager", "admin"]],
    ["user:update", ["user", "manager", "admin"]],
    ["user:delete", ["admin"]],

    // Restaurant permissions
    ["restaurant:create", ["manager", "admin"]],
    ["restaurant:read", ["guest", "user", "manager", "admin"]],
    ["restaurant:update", ["manager", "admin"]],
    ["restaurant:delete", ["admin"]],

    // Reservation permissions
    ["reservation:create", ["user", "manager", "admin"]],
    ["reservation:read", ["user", "manager", "admin"]],
    ["reservation:update", ["user", "manager", "admin"]],
    ["reservation:cancel", ["user", "manager", "admin"]],

    // Payment permissions
    ["payment:process", ["user", "manager", "admin"]],
    ["payment:refund", ["manager", "admin"]],
    ["payment:read", ["user", "manager", "admin"]],
  ]);

  hasPermission(userRoles: string[], permission: string): boolean {
    const allowedRoles = this.permissions.get(permission) || [];
    return userRoles.some((role) => allowedRoles.includes(role));
  }

  hasRole(userRoles: string[], requiredRole: string): boolean {
    return userRoles.some((role) => {
      if (role === requiredRole) return true;
      const inheritedRoles = this.roleHierarchy.get(role) || [];
      return inheritedRoles.includes(requiredRole);
    });
  }

  canAccessResource(
    userRoles: string[],
    resourceOwnerId: string,
    currentUserId: string,
    permission: string
  ): boolean {
    // Owner can always access their own resources
    if (resourceOwnerId === currentUserId) {
      return true;
    }

    // Check if user has admin/manager permissions
    return this.hasPermission(userRoles, permission);
  }
}

// Permission decorator
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata("permissions", permissions);

// RBAC Guard
@Injectable()
export class RbacGuard implements CanActivate {
  constructor(private reflector: Reflector, private rbacService: RbacService) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.get<string[]>(
      "permissions",
      context.getHandler()
    );

    if (!requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false;
    }

    return requiredPermissions.some((permission) =>
      this.rbacService.hasPermission(user.roles, permission)
    );
  }
}
```

#### API Security Middleware

```typescript
// apps/libs/common/security/security.middleware.ts
@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Security headers
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=()"
    );

    // CSP Header
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self';"
    );

    // HSTS Header (only in production with HTTPS)
    if (process.env.NODE_ENV === "production") {
      res.setHeader(
        "Strict-Transport-Security",
        "max-age=31536000; includeSubDomains; preload"
      );
    }

    next();
  }
}

// Request validation and sanitization
@Injectable()
export class RequestValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type === "body") {
      // Sanitize input to prevent XSS
      return this.sanitizeObject(value);
    }
    return value;
  }

  private sanitizeObject(obj: any): any {
    if (typeof obj === "string") {
      return obj.replace(
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        ""
      );
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitizeObject(item));
    }

    if (typeof obj === "object" && obj !== null) {
      const sanitized = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = this.sanitizeObject(value);
      }
      return sanitized;
    }

    return obj;
  }
}
```

### Data Encryption and Privacy

#### PII Encryption Service

```typescript
// apps/libs/common/encryption/encryption.service.ts
@Injectable()
export class EncryptionService {
  private readonly algorithm = "aes-256-gcm";
  private readonly keyDerivationIterations = 100000;

  constructor(@Inject("ENCRYPTION_CONFIG") private config: EncryptionConfig) {}

  async encryptPII(data: string): Promise<EncryptedData> {
    const salt = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);

    const key = crypto.pbkdf2Sync(
      this.config.masterKey,
      salt,
      this.keyDerivationIterations,
      32,
      "sha256"
    );

    const cipher = crypto.createCipher(this.algorithm, key, iv);
    let encrypted = cipher.update(data, "utf8", "base64");
    encrypted += cipher.final("base64");

    const authTag = cipher.getAuthTag();

    return {
      encrypted,
      salt: salt.toString("base64"),
      iv: iv.toString("base64"),
      authTag: authTag.toString("base64"),
    };
  }

  async decryptPII(encryptedData: EncryptedData): Promise<string> {
    const salt = Buffer.from(encryptedData.salt, "base64");
    const iv = Buffer.from(encryptedData.iv, "base64");
    const authTag = Buffer.from(encryptedData.authTag, "base64");

    const key = crypto.pbkdf2Sync(
      this.config.masterKey,
      salt,
      this.keyDerivationIterations,
      32,
      "sha256"
    );

    const decipher = crypto.createDecipher(this.algorithm, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedData.encrypted, "base64", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  }

  hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString("hex");
  }
}

// PII Entity with encryption
@Entity("users")
export class UserEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column("text")
  encryptedName: string; // Encrypted PII

  @Column("text", { nullable: true })
  encryptedPhone: string; // Encrypted PII

  @Column("jsonb", { nullable: true })
  encryptionMetadata: EncryptedData; // Store encryption metadata

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

## 🚀 Setup and Deployment Scripts

### Development Environment Setup

```bash
#!/bin/bash
# scripts/setup-development.sh

set -e

echo "🚀 Setting up DatBan Microservices Development Environment..."

# Check prerequisites
check_prerequisites() {
  echo "Checking prerequisites..."

  if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed"
    exit 1
  fi

  if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed"
    exit 1
  fi

  if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    exit 1
  fi

  echo "✅ Prerequisites check passed"
}

# Setup environment files
setup_environment() {
  echo "Setting up environment files..."

  # Create .env files from templates
  services=("user-service" "restaurant-service" "reservation-service" "payment-service" "notification-service" "analytics-service")

  for service in "${services[@]}"; do
    if [ ! -f "apps/${service}/.env" ]; then
      cp "apps/${service}/.env.example" "apps/${service}/.env"
      echo "✅ Created .env file for ${service}"
    fi
  done

  # Create infrastructure .env
  if [ ! -f "infrastructure/.env" ]; then
    cat > infrastructure/.env << EOF
# Database Configuration
POSTGRES_USER=datban
POSTGRES_PASSWORD=datban123
MONGO_INITDB_ROOT_USERNAME=datban
MONGO_INITDB_ROOT_PASSWORD=datban123

# RabbitMQ Configuration
RABBITMQ_DEFAULT_USER=datban
RABBITMQ_DEFAULT_PASS=datban123

# JWT Configuration
JWT_ACCESS_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)

# Encryption
ENCRYPTION_MASTER_KEY=$(openssl rand -base64 32)

# External Services
STRIPE_SECRET_KEY=sk_test_your_stripe_key
SENDGRID_API_KEY=your_sendgrid_api_key

# Frontend URL
FRONTEND_URL=http://localhost:3000
EOF
    echo "✅ Created infrastructure .env file"
  fi
}

# Install dependencies
install_dependencies() {
  echo "Installing dependencies..."
  npm install
  echo "✅ Dependencies installed"
}

# Generate gRPC code
generate_grpc() {
  echo "Generating gRPC code..."
  npm run proto:generate
  echo "✅ gRPC code generated"
}

# Start infrastructure services
start_infrastructure() {
  echo "Starting infrastructure services..."
  cd infrastructure
  docker-compose -f docker-compose.infrastructure.yml up -d
  cd ..

  echo "Waiting for services to be ready..."
  sleep 30

  # Check if services are healthy
  check_service_health "PostgreSQL" "localhost:5432"
  check_service_health "MongoDB" "localhost:27017"
  check_service_health "Redis" "localhost:6379"
  check_service_health "RabbitMQ" "localhost:5672"
  check_service_health "Kong" "localhost:8000"

  echo "✅ Infrastructure services started"
}

check_service_health() {
  local name="$1"
  local target="$2"
  local host="${target%%:*}"
  local port="${target##*:}"

  echo "Checking $name at $host:$port ..."
  for i in {1..30}; do
    if nc -z "$host" "$port" 2>/dev/null; then
      echo "✅ $name is healthy"
      return 0
    fi
    sleep 2
  done
  echo "❌ $name failed health check"
  exit 1
}

run_migrations() {
  echo "Running database migrations..."
  npm run migrate -ws --if-present || true
  echo "✅ Migrations completed (if any)"
}

seed_data() {
  echo "Seeding databases..."
  npm run seed -ws --if-present || true
  echo "✅ Seeding completed (if any)"
}

start_microservices() {
  echo "Starting microservices..."
  if [ -f "infrastructure/docker-compose.services.yml" ]; then
    docker-compose -f infrastructure/docker-compose.services.yml up -d
  else
    npm run dev -ws --if-present || true
  fi
  echo "✅ Microservices started"
}

graceful_shutdown() {
  echo "Shutting down..."
  if [ -f "infrastructure/docker-compose.services.yml" ]; then
    docker-compose -f infrastructure/docker-compose.services.yml down -v || true
  fi
  if [ -f "infrastructure/docker-compose.infrastructure.yml" ]; then
    (cd infrastructure && docker-compose -f docker-compose.infrastructure.yml down -v) || true
  fi
  echo "✅ Shutdown complete"
}

main() {
  trap graceful_shutdown EXIT
  check_prerequisites
  setup_environment
  install_dependencies
  generate_grpc
  start_infrastructure
  run_migrations
  seed_data
  start_microservices
  echo "🎉 Development environment is ready."
}

main "$@"

```

### Infrastructure Docker Compose

```yaml
# infrastructure/docker-compose.infrastructure.yml
version: "3.8"

services:
  # PostgreSQL databases
  postgres-users:
    image: postgres:15-alpine
    container_name: datban-postgres-users
    environment:
      POSTGRES_DB: datban_users
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - postgres_users_data:/var/lib/postgresql/data
      - ./sql/init-users.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d datban_users"]
      interval: 10s
      timeout: 5s
      retries: 5

  postgres-reservations:
    image: postgres:15-alpine
    container_name: datban-postgres-reservations
    environment:
      POSTGRES_DB: datban_reservations
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    ports:
      - "5433:5432"
    volumes:
      - postgres_reservations_data:/var/lib/postgresql/data
      - ./sql/init-reservations.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test:
        ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d datban_reservations"]
      interval: 10s
      timeout: 5s
      retries: 5

  postgres-payments:
    image: postgres:15-alpine
    container_name: datban-postgres-payments
    environment:
      POSTGRES_DB: datban_payments
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    ports:
      - "5434:5432"
    volumes:
      - postgres_payments_data:/var/lib/postgresql/data
      - ./sql/init-payments.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d datban_payments"]
      interval: 10s
      timeout: 5s
      retries: 5

  # MongoDB
  mongodb:
    image: mongo:7.0
    container_name: datban-mongodb
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_INITDB_ROOT_USERNAME}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_INITDB_ROOT_PASSWORD}
      MONGO_INITDB_DATABASE: datban_restaurants
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
      - ./mongo/init-restaurants.js:/docker-entrypoint-initdb.d/init.js
    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongosh localhost:27017/test --quiet
      interval: 10s
      timeout: 10s
      retries: 5

  # Redis
  redis:
    image: redis:7.2-alpine
    container_name: datban-redis
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD:-datban123}
    volumes:
      - redis_data:/data
      - ./redis/redis.conf:/usr/local/etc/redis/redis.conf
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # RabbitMQ
  rabbitmq:
    image: rabbitmq:3.12-management-alpine
    container_name: datban-rabbitmq
    environment:
      RABBITMQ_DEFAULT_USER: ${RABBITMQ_DEFAULT_USER}
      RABBITMQ_DEFAULT_PASS: ${RABBITMQ_DEFAULT_PASS}
      RABBITMQ_ERLANG_COOKIE: datban_cookie_secret
    ports:
      - "5672:5672"
      - "15672:15672"
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
      - ./rabbitmq/definitions.json:/etc/rabbitmq/definitions.json
      - ./rabbitmq/rabbitmq.conf:/etc/rabbitmq/rabbitmq.conf
    healthcheck:
      test: rabbitmq-diagnostics -q ping
      interval: 30s
      timeout: 30s
      retries: 5

  # Kong Gateway
  kong:
    image: kong:3.4-alpine
    container_name: datban-kong
    environment:
      KONG_DATABASE: "off"
      KONG_DECLARATIVE_CONFIG: /kong/kong.yml
      KONG_PROXY_ACCESS_LOG: /dev/stdout
      KONG_ADMIN_ACCESS_LOG: /dev/stdout
      KONG_PROXY_ERROR_LOG: /dev/stderr
      KONG_ADMIN_ERROR_LOG: /dev/stderr
      KONG_ADMIN_LISTEN: 0.0.0.0:8001
      KONG_ADMIN_GUI_URL: http://localhost:8002
    ports:
      - "8000:8000" # Proxy
      - "8443:8443" # Proxy SSL
      - "8001:8001" # Admin API
      - "8444:8444" # Admin API SSL
      - "8002:8002" # Kong Manager
    volumes:
      - ./kong/kong.yml:/kong/kong.yml
    healthcheck:
      test: ["CMD", "kong", "health"]
      interval: 10s
      timeout: 10s
      retries: 10
    depends_on:
      - rabbitmq

volumes:
  postgres_users_data:
  postgres_reservations_data:
  postgres_payments_data:
  mongodb_data:
  redis_data:
  rabbitmq_data:

networks:
  default:
    name: datban-network
```

### Monitoring Stack Configuration

```yaml
# infrastructure/monitoring/docker-compose.yml
version: "3.8"

services:
  prometheus:
    image: prom/prometheus:v2.45.0
    container_name: datban-prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
      - ./prometheus/alert.rules.yml:/etc/prometheus/alert.rules.yml
      - prometheus_data:/prometheus
    command:
      - "--config.file=/etc/prometheus/prometheus.yml"
      - "--storage.tsdb.path=/prometheus"
      - "--web.console.libraries=/etc/prometheus/console_libraries"
      - "--web.console.templates=/etc/prometheus/consoles"
      - "--web.enable-lifecycle"
      - "--web.enable-admin-api"
    networks:
      - datban-network

  grafana:
    image: grafana/grafana:10.1.0
    container_name: datban-grafana
    ports:
      - "3000:3000"
    environment:
      GF_SECURITY_ADMIN_PASSWORD: datban123
      GF_USERS_ALLOW_SIGN_UP: false
    volumes:
      - grafana_data:/var/lib/grafana
      - ./grafana/dashboards:/etc/grafana/provisioning/dashboards
      - ./grafana/datasources:/etc/grafana/provisioning/datasources
      - ./grafana/dashboards-config:/var/lib/grafana/dashboards
    networks:
      - datban-network
    depends_on:
      - prometheus

  alertmanager:
    image: prom/alertmanager:v0.25.0
    container_name: datban-alertmanager
    ports:
      - "9093:9093"
    volumes:
      - ./alertmanager/alertmanager.yml:/etc/alertmanager/alertmanager.yml
      - alertmanager_data:/alertmanager
    networks:
      - datban-network

  zipkin:
    image: openzipkin/zipkin:2.24
    container_name: datban-zipkin
    ports:
      - "9411:9411"
    environment:
      STORAGE_TYPE: mem
    networks:
      - datban-network

  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.8.0
    container_name: datban-elasticsearch
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
      - xpack.security.enabled=false
    ports:
      - "9200:9200"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data
    networks:
      - datban-network

  kibana:
    image: docker.elastic.co/kibana/kibana:8.8.0
    container_name: datban-kibana
    ports:
      - "5601:5601"
    environment:
      ELASTICSEARCH_HOSTS: http://elasticsearch:9200
    networks:
      - datban-network
    depends_on:
      - elasticsearch

  logstash:
    image: docker.elastic.co/logstash/logstash:8.8.0
    container_name: datban-logstash
    volumes:
      - ./logstash/pipeline:/usr/share/logstash/pipeline
      - ./logstash/config/logstash.yml:/usr/share/logstash/config/logstash.yml
    networks:
      - datban-network
    depends_on:
      - elasticsearch

volumes:
  prometheus_data:
  grafana_data:
  alertmanager_data:
  elasticsearch_data:

networks:
  datban-network:
    external: true
```

### Production Deployment Scripts

```bash
#!/bin/bash
# scripts/deploy-production.sh

set -e

ENVIRONMENT=${1:-staging}
VERSION=${2:-latest}

echo "🚀 Deploying DatBan Microservices to $ENVIRONMENT..."

# Production deployment function
deploy_to_production() {
  echo "Preparing production deployment..."

  # Build and push Docker images
  build_and_push_images

  # Update Kubernetes manifests
  update_k8s_manifests

  # Deploy to Kubernetes
  deploy_to_kubernetes

  # Run health checks
  run_health_checks

  # Update load balancer
  update_load_balancer

  echo "✅ Production deployment completed successfully!"
}

# Build and push Docker images
build_and_push_images() {
  echo "Building and pushing Docker images..."

  services=("user-service" "restaurant-service" "reservation-service"
           "payment-service" "notification-service" "analytics-service")

  for service in "${services[@]}"; do
    echo "Building $service..."

    docker build -t "datban-$service:$VERSION" "./apps/$service"
    docker tag "datban-$service:$VERSION" "your-registry.com/datban-$service:$VERSION"
    docker push "your-registry.com/datban-$service:$VERSION"

    echo "✅ Built and pushed $service"
  done
}

# Update Kubernetes manifests
update_k8s_manifests() {
  echo "Updating Kubernetes manifests..."

  # Replace image tags
  find k8s/ -name "*.yaml" -type f -exec sed -i "s/IMAGE_TAG/$VERSION/g" {} \;

  # Apply environment-specific configurations
  kubectl apply -f "k8s/environments/$ENVIRONMENT/"
}

# Deploy to Kubernetes
deploy_to_kubernetes() {
  echo "Deploying to Kubernetes..."

  # Deploy infrastructure components first
  kubectl apply -f k8s/infrastructure/

  # Wait for infrastructure to be ready
  kubectl wait --for=condition=Ready pod -l app=postgresql --timeout=300s
  kubectl wait --for=condition=Ready pod -l app=mongodb --timeout=300s
  kubectl wait --for=condition=Ready pod -l app=redis --timeout=300s
  kubectl wait --for=condition=Ready pod -l app=rabbitmq --timeout=300s

  # Deploy microservices
  kubectl apply -f k8s/services/

  # Wait for services to be ready
  services=("user-service" "restaurant-service" "reservation-service"
           "payment-service" "notification-service" "analytics-service")

  for service in "${services[@]}"; do
    kubectl wait --for=condition=Available deployment/$service --timeout=300s
    echo "✅ $service deployed successfully"
  done
}

# Health checks
run_health_checks() {
  echo "Running health checks..."

  # Wait for services to be fully ready
  sleep 30

  services=("user-service:3001" "restaurant-service:3002" "reservation-service:3003"
           "payment-service:3004" "notification-service:3005" "analytics-service:3006")

  for service_port in "${services[@]}"; do
    service=${service_port%:*}
    port=${service_port#*:}

    echo "Checking health for $service..."

    if kubectl exec -n datban deployment/$service -- curl -f http://localhost:$port/health > /dev/null 2>&1; then
      echo "✅ $service is healthy"
    else
      echo "❌ $service health check failed"
      exit 1
    fi
  done
}

# Update load balancer
update_load_balancer() {
  echo "Updating load balancer configuration..."

  # Update Kong configuration
  kubectl apply -f k8s/kong/

  # Wait for Kong to be ready
  kubectl wait --for=condition=Ready pod -l app=kong --timeout=120s

  echo "✅ Load balancer updated"
}

# Database migration
run_migrations() {
  echo "Running database migrations..."

  # User service migrations
  kubectl exec -n datban deployment/user-service -- npm run migration:run

  # Reservation service migrations
  kubectl exec -n datban deployment/reservation-service -- npm run migration:run

  # Payment service migrations
  kubectl exec -n datban deployment/payment-service -- npm run migration:run

  echo "✅ Database migrations completed"
}

# Rollback function
rollback() {
  local previous_version=$1

  echo "🔄 Rolling back to version $previous_version..."

  # Update manifests with previous version
  find k8s/ -name "*.yaml" -type f -exec sed -i "s/$VERSION/$previous_version/g" {} \;

  # Apply rollback
  kubectl apply -f k8s/services/

  # Wait for rollback to complete
  kubectl rollout status deployment/user-service -n datban
  kubectl rollout status deployment/restaurant-service -n datban
  kubectl rollout status deployment/reservation-service -n datban
  kubectl rollout status deployment/payment-service -n datban
  kubectl rollout status deployment/notification-service -n datban
  kubectl rollout status deployment/analytics-service -n datban

  echo "✅ Rollback completed"
}

# Blue-green deployment
blue_green_deploy() {
  echo "Starting blue-green deployment..."

  # Deploy to green environment
  kubectl apply -f k8s/blue-green/green/

  # Wait for green deployment to be ready
  kubectl wait --for=condition=Available deployment -l version=green --timeout=600s

  # Run smoke tests on green environment
  run_smoke_tests "green"

  # Switch traffic to green
  kubectl patch service user-service -p '{"spec":{"selector":{"version":"green"}}}'
  kubectl patch service restaurant-service -p '{"spec":{"selector":{"version":"green"}}}'
  kubectl patch service reservation-service -p '{"spec":{"selector":{"version":"green"}}}'
  kubectl patch service payment-service -p '{"spec":{"selector":{"version":"green"}}}'
  kubectl patch service notification-service -p '{"spec":{"selector":{"version":"green"}}}'
  kubectl patch service analytics-service -p '{"spec":{"selector":{"version":"green"}}}'

  # Monitor for 5 minutes
  echo "Monitoring green deployment for 5 minutes..."
  sleep 300

  # Clean up blue environment
  kubectl delete -f k8s/blue-green/blue/

  echo "✅ Blue-green deployment completed"
}

# Smoke tests
run_smoke_tests() {
  local environment=$1

  echo "Running smoke tests on $environment environment..."

  # Test user service
  test_endpoint "http://user-service-$environment:3001/health" "User Service"

  # Test restaurant service
  test_endpoint "http://restaurant-service-$environment:3002/health" "Restaurant Service"

  # Test reservation service
  test_endpoint "http://reservation-service-$environment:3003/health" "Reservation Service"

  # Test payment service
  test_endpoint "http://payment-service-$environment:3004/health" "Payment Service"

  # Test notification service
  test_endpoint "http://notification-service-$environment:3005/health" "Notification Service"

  # Test analytics service
  test_endpoint "http://analytics-service-$environment:3006/health" "Analytics Service"

  echo "✅ All smoke tests passed"
}

# Test endpoint helper
test_endpoint() {
  local endpoint=$1
  local service_name=$2

  if kubectl run test-pod --rm -i --restart=Never --image=curlimages/curl -- curl -f "$endpoint" > /dev/null 2>&1; then
    echo "✅ $service_name smoke test passed"
  else
    echo "❌ $service_name smoke test failed"
    exit 1
  fi
}

# Main deployment logic
case "$ENVIRONMENT" in
  "staging")
    echo "Deploying to staging environment..."
    deploy_to_production
    ;;
  "production")
    echo "Deploying to production environment with blue-green strategy..."
    blue_green_deploy
    ;;
  "rollback")
    if [ -z "$VERSION" ]; then
      echo "❌ Version is required for rollback"
      exit 1
    fi
    rollback "$VERSION"
    ;;
  *)
    echo "❌ Unknown environment: $ENVIRONMENT"
    echo "Usage: $0 [staging|production|rollback] [version]"
    exit 1
    ;;
esac
```

### Package.json Scripts Configuration

```json
{
  "name": "datban-microservices",
  "version": "1.0.0",
  "description": "DatBan Restaurant Reservation System - Microservices Architecture",
  "scripts": {
    "dev": "concurrently \"npm run dev:user\" \"npm run dev:restaurant\" \"npm run dev:reservation\" \"npm run dev:payment\" \"npm run dev:notification\" \"npm run dev:analytics\"",
    "dev:user": "cd apps/user-service && npm run start:dev",
    "dev:restaurant": "cd apps/restaurant-service && npm run start:dev",
    "dev:reservation": "cd apps/reservation-service && npm run start:dev",
    "dev:payment": "cd apps/payment-service && npm run start:dev",
    "dev:notification": "cd apps/notification-service && npm run start:dev",
    "dev:analytics": "cd apps/analytics-service && npm run start:dev",

    "build": "npm run build:user && npm run build:restaurant && npm run build:reservation && npm run build:payment && npm run build:notification && npm run build:analytics",
    "build:user": "cd apps/user-service && npm run build",
    "build:restaurant": "cd apps/restaurant-service && npm run build",
    "build:reservation": "cd apps/reservation-service && npm run build",
    "build:payment": "cd apps/payment-service && npm run build",
    "build:notification": "cd apps/notification-service && npm run build",
    "build:analytics": "cd apps/analytics-service && npm run build",

    "test": "npm run test:user && npm run test:restaurant && npm run test:reservation && npm run test:payment && npm run test:notification && npm run test:analytics",
    "test:user": "cd apps/user-service && npm run test",
    "test:restaurant": "cd apps/restaurant-service && npm run test",
    "test:reservation": "cd apps/reservation-service && npm run test",
    "test:payment": "cd apps/payment-service && npm run test",
    "test:notification": "cd apps/notification-service && npm run test",
    "test:analytics": "cd apps/analytics-service && npm run test",

    "test:integration": "npm run test:integration:user && npm run test:integration:restaurant && npm run test:integration:reservation && npm run test:integration:payment && npm run test:integration:notification && npm run test:integration:analytics",
    "test:integration:user": "cd apps/user-service && npm run test:integration",
    "test:integration:restaurant": "cd apps/restaurant-service && npm run test:integration",
    "test:integration:reservation": "cd apps/reservation-service && npm run test:integration",
    "test:integration:payment": "cd apps/payment-service && npm run test:integration",
    "test:integration:notification": "cd apps/notification-service && npm run test:integration",
    "test:integration:analytics": "cd apps/analytics-service && npm run test:integration",

    "test:e2e": "jest --config=test/e2e/jest-e2e.json --runInBand",
    "test:load": "artillery run test/load/load-test.yml",

    "proto:generate": "./scripts/generate-proto.sh",
    "proto:user": "protoc --plugin=node_modules/.bin/protoc-gen-ts_proto --ts_proto_out=libs/proto --proto_path=proto proto/user.proto",
    "proto:restaurant": "protoc --plugin=node_modules/.bin/protoc-gen-ts_proto --ts_proto_out=libs/proto --proto_path=proto proto/restaurant.proto",
    "proto:reservation": "protoc --plugin=node_modules/.bin/protoc-gen-ts_proto --ts_proto_out=libs/proto --proto_path=proto proto/reservation.proto",
    "proto:payment": "protoc --plugin=node_modules/.bin/protoc-gen-ts_proto --ts_proto_out=libs/proto --proto_path=proto proto/payment.proto",

    "migration:generate:user": "cd apps/user-service && npm run migration:generate",
    "migration:run:user": "cd apps/user-service && npm run migration:run",
    "migration:revert:user": "cd apps/user-service && npm run migration:revert",
    "migration:generate:reservation": "cd apps/reservation-service && npm run migration:generate",
    "migration:run:reservation": "cd apps/reservation-service && npm run migration:run",
    "migration:revert:reservation": "cd apps/reservation-service && npm run migration:revert",
    "migration:generate:payment": "cd apps/payment-service && npm run migration:generate",
    "migration:run:payment": "cd apps/payment-service && npm run migration:run",
    "migration:revert:payment": "cd apps/payment-service && npm run migration:revert",

    "seed:restaurants": "cd apps/restaurant-service && npm run seed:data",
    "seed:test-users": "cd apps/user-service && npm run seed:test-data",

    "lint": "npm run lint:user && npm run lint:restaurant && npm run lint:reservation && npm run lint:payment && npm run lint:notification && npm run lint:analytics",
    "lint:user": "cd apps/user-service && npm run lint",
    "lint:restaurant": "cd apps/restaurant-service && npm run lint",
    "lint:reservation": "cd apps/reservation-service && npm run lint",
    "lint:payment": "cd apps/payment-service && npm run lint",
    "lint:notification": "cd apps/notification-service && npm run lint",
    "lint:analytics": "cd apps/analytics-service && npm run lint",

    "format": "prettier --write \"**/*.{ts,js,json,md}\"",
    "format:check": "prettier --check \"**/*.{ts,js,json,md}\"",

    "docker:build": "./scripts/docker-build.sh",
    "docker:up": "docker-compose -f infrastructure/docker-compose.yml up -d",
    "docker:down": "docker-compose -f infrastructure/docker-compose.yml down",
    "docker:logs": "docker-compose -f infrastructure/docker-compose.yml logs -f",

    "k8s:deploy": "./scripts/deploy-production.sh",
    "k8s:rollback": "./scripts/deploy-production.sh rollback",

    "monitoring:up": "docker-compose -f infrastructure/monitoring/docker-compose.yml up -d",
    "monitoring:down": "docker-compose -f infrastructure/monitoring/docker-compose.yml down"
  },
  "devDependencies": {
    "concurrently": "^8.2.2",
    "artillery": "^2.0.0",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.5",
    "ts-jest": "^29.1.1",
    "supertest": "^6.3.3",
    "@types/supertest": "^2.0.12",
    "testcontainers": "^10.2.1",
    "prettier": "^3.0.3",
    "eslint": "^8.50.0",
    "@typescript-eslint/eslint-plugin": "^6.7.2",
    "@typescript-eslint/parser": "^6.7.2",
    "husky": "^8.0.3",
    "lint-staged": "^14.0.1"
  },
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "npm run test && npm run test:integration"
    }
  },
  "lint-staged": {
    "*.{ts,js}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

## 📚 Documentation Structure

### API Documentation

Each microservice includes comprehensive API documentation using Swagger/OpenAPI 3.0 specifications. The documentation covers:

- **Authentication endpoints** with JWT token management
- **Resource CRUD operations** with detailed request/response schemas
- **Error responses** with standardized error codes
- **Rate limiting information** and usage examples
- **Webhook endpoints** for external integrations

### Event Documentation

AsyncAPI specifications document all inter-service communication:

- **Event schemas** with JSON Schema validation
- **Event flows** showing complete business processes
- **Error handling patterns** for failed event processing
- **Event versioning strategies** for backward compatibility

### Deployment Guides

Step-by-step guides for different deployment scenarios:

- **Local development setup** with Docker Compose
- **Staging environment deployment** with basic Kubernetes
- **Production deployment** with blue-green strategies
- **Monitoring and alerting setup** with complete observability stack

## 🎯 Best Practices Summary

### Architecture Principles

1. **Single Responsibility**: Each service owns a specific business domain
2. **Database per Service**: No shared databases between services
3. **Event-First Design**: Services communicate primarily through events
4. **Circuit Breaker Pattern**: Resilient inter-service communication
5. **CQRS Implementation**: Separate read and write models where beneficial

### Security Standards

1. **Zero Trust Architecture**: All service communications are authenticated
2. **Principle of Least Privilege**: Services have minimal required permissions
3. **Data Encryption**: PII encrypted at rest and in transit
4. **Input Validation**: Comprehensive validation at all service boundaries
5. **Audit Logging**: Complete audit trail for all business operations

### Performance Guidelines

1. **Database Optimization**: Proper indexing and query optimization
2. **Caching Strategy**: Multi-layer caching with Redis
3. **Async Processing**: Background jobs for non-critical operations
4. **Resource Limits**: Defined resource constraints for all services
5. **Monitoring**: Comprehensive metrics and alerting

### Operational Excellence

1. **Infrastructure as Code**: All infrastructure defined in version control
2. **Automated Testing**: 100% test coverage with multiple test types
3. **CI/CD Pipeline**: Automated build, test, and deployment
4. **Disaster Recovery**: Regular backups and recovery procedures
5. **Documentation**: Living documentation that evolves with the system

## 🚀 Getting Started Quick Guide

### Prerequisites

- Node.js 20+ with npm
- Docker and Docker Compose
- kubectl (for Kubernetes deployment)
- Git

### Local Development Setup

```bash
# Clone the repository
git clone https://github.com/your-org/datban-microservices.git
cd datban-microservices

# Run the setup script
chmod +x scripts/setup-development.sh
./scripts/setup-development.sh

# Start all services
npm run dev
```

### Accessing Services

- **API Gateway**: http://localhost:8000
- **User Service**: http://localhost:3001
- **Restaurant Service**: http://localhost:3002
- **Reservation Service**: http://localhost:3003
- **Payment Service**: http://localhost:3004
- **Notification Service**: http://localhost:3005
- **Analytics Service**: http://localhost:3006
- **RabbitMQ Management**: http://localhost:15672
- **Grafana Dashboard**: http://localhost:3000
- **Prometheus**: http://localhost:9090
- **Zipkin Tracing**: http://localhost:9411

### Sample API Calls

```bash
# Register a new user
curl -X POST http://localhost:8000/api/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePassword123!",
    "name": "John Doe",
    "phone": "+1234567890"
  }'

# Login
curl -X POST http://localhost:8000/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePassword123!"
  }'

# Search restaurants
curl -X GET "http://localhost:8000/api/v1/restaurants/search?cuisine=italian&location=hanoi&date=2024-12-25" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Create reservation
curl -X POST http://localhost:8000/api/v1/reservations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "restaurantId": "507f1f77bcf86cd799439011",
    "dateTime": "2024-12-25T19:00:00Z",
    "partySize": 4,
    "specialRequests": "Window table preferred"
  }'
```

## 🎯 Development Workflow

### Feature Development

1. **Create Feature Branch**

```bash
git checkout -b feature/new-feature-name
```

2. **Develop with TDD**

   - Write failing tests first
   - Implement feature to pass tests
   - Refactor while maintaining green tests

3. **Run Quality Checks**

```bash
npm run lint
npm run test
npm run test:integration
```

4. **Create Pull Request**
   - Ensure all CI checks pass
   - Include comprehensive test coverage
   - Update documentation as needed

### Testing Strategy

The project follows a comprehensive testing pyramid:

#### Unit Tests (70% of tests)

- Test business logic in isolation
- Mock external dependencies
- Fast execution (< 1 second per test)

#### Integration Tests (20% of tests)

- Test service interactions with real dependencies
- Use Testcontainers for database/message broker
- Moderate execution time (< 30 seconds per test)

#### End-to-End Tests (10% of tests)

- Test complete business workflows
- Run against staging environment
- Slower execution but high confidence

### Code Quality Standards

- **TypeScript**: Strict mode with comprehensive type checking
- **ESLint**: Enforced code style and best practices
- **Prettier**: Consistent code formatting
- **Husky**: Pre-commit hooks for quality gates
- **SonarQube**: Code quality and security analysis

## 🔧 Troubleshooting Guide

### Common Issues and Solutions

#### Service Won't Start

```bash
# Check if ports are in use
lsof -i :3001

# Kill processes using ports
kill -9 $(lsof -t -i:3001)

# Restart infrastructure services
docker-compose -f infrastructure/docker-compose.infrastructure.yml restart
```

#### Database Connection Issues

```bash
# Check database containers
docker ps | grep postgres
docker ps | grep mongo

# Check database logs
docker logs datban-postgres-users
docker logs datban-mongodb

# Reset databases
docker-compose -f infrastructure/docker-compose.infrastructure.yml down -v
docker-compose -f infrastructure/docker-compose.infrastructure.yml up -d
```

#### Event Processing Issues

```bash
# Check RabbitMQ status
curl http://localhost:15672/api/overview

# Check queue depths
curl -u datban:datban123 http://localhost:15672/api/queues

# Restart RabbitMQ
docker restart datban-rabbitmq
```

#### Performance Issues

```bash
# Check resource usage
docker stats

# Monitor service health
curl http://localhost:3001/health/detailed
curl http://localhost:3002/health/detailed

# Check Grafana dashboards
# Navigate to http://localhost:3000
```

### Monitoring and Alerting

The system includes comprehensive monitoring with alerts for:

- **Service Health**: Automatic alerts for service downtime
- **Response Times**: Alerts for degraded performance
- **Error Rates**: Alerts for increased error percentages
- **Resource Usage**: Alerts for high CPU/memory usage
- **Business Metrics**: Alerts for unusual business patterns

### Disaster Recovery Procedures

#### Database Backup and Restore

```bash
# Backup PostgreSQL databases
docker exec datban-postgres-users pg_dump -U datban datban_users > backup_users.sql
docker exec datban-postgres-reservations pg_dump -U datban datban_reservations > backup_reservations.sql
docker exec datban-postgres-payments pg_dump -U datban datban_payments > backup_payments.sql

# Backup MongoDB
docker exec datban-mongodb mongodump --username datban --password datban123 --authenticationDatabase admin --db datban_restaurants --out /backup

# Restore procedures documented in infrastructure/backup/restore-procedures.md
```

#### Service Recovery

```bash
# Quick service restart
kubectl rollout restart deployment/user-service -n datban

# Full system recovery
kubectl apply -f k8s/disaster-recovery/
```

## 📊 Performance Benchmarks

### Expected Performance Metrics

| Service              | RPS   | Avg Response Time | P95 Response Time |
| -------------------- | ----- | ----------------- | ----------------- |
| User Service         | 1000+ | < 50ms            | < 100ms           |
| Restaurant Service   | 2000+ | < 30ms            | < 80ms            |
| Reservation Service  | 500+  | < 100ms           | < 200ms           |
| Payment Service      | 200+  | < 200ms           | < 500ms           |
| Notification Service | 1000+ | < 20ms            | < 50ms            |
| Analytics Service    | 100+  | < 500ms           | < 1000ms          |

### Load Testing

```bash
# Run comprehensive load tests
npm run test:load

# Custom load test scenarios
artillery run test/load/reservation-flow.yml
artillery run test/load/search-performance.yml
artillery run test/load/payment-processing.yml
```

## 🌟 Advanced Features

### Event Sourcing Implementation

Selected services use event sourcing for complete audit trails and temporal queries.

### CQRS Pattern

Separate read and write models for optimized performance and scalability.

### Saga Pattern

Distributed transaction management for complex business workflows.

### API Versioning

Comprehensive versioning strategy supporting backward compatibility.

### Multi-tenancy Support

Architecture supports multiple restaurant chains with data isolation.

## 📈 Roadmap and Future Enhancements

### Phase 1 (Current) - Core Functionality

- [x] User management and authentication
- [x] Restaurant and menu management
- [x] Reservation booking system
- [x] Payment processing
- [x] Basic notifications

### Phase 2 - Enhanced Features

- [ ] Real-time availability updates
- [ ] Advanced search with ML recommendations
- [ ] Mobile push notifications
- [ ] Social media integrations
- [ ] Loyalty program management

### Phase 3 - Enterprise Features

- [ ] Multi-language support
- [ ] Advanced analytics and reporting
- [ ] Restaurant chain management
- [ ] Third-party POS integrations
- [ ] White-label solutions

### Phase 4 - AI/ML Integration

- [ ] Demand forecasting
- [ ] Dynamic pricing
- [ ] Personalized recommendations
- [ ] Fraud detection
- [ ] Automated customer support

## 🤝 Contributing

### Development Guidelines

1. **Follow the established architecture patterns**
2. **Maintain comprehensive test coverage**
3. **Document all API changes**
4. **Follow semantic versioning**
5. **Ensure backward compatibility**

### Code Review Process

1. **Automated checks must pass**
2. **At least two reviewer approvals required**
3. **Architecture review for significant changes**
4. **Security review for sensitive modifications**
5. **Performance impact assessment**

### Getting Help

- **Technical Issues**: Create GitHub issues
- **Architecture Questions**: Contact the architecture team
- **Security Concerns**: Use security disclosure process
- **Documentation**: Contribute to living documentation

## 📄 License and Legal

This project is proprietary software. All rights reserved.

For licensing inquiries, contact: legal@datban.com

---

**DatBan Microservices Architecture v1.0**

_A comprehensive, scalable, and production-ready restaurant reservation system built with modern microservices principles and best practices._

**Built with ❤️ by the DatBan Engineering Team**
