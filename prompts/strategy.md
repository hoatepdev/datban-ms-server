You are an expert software architect specializing in Domain-Driven Design (DDD), CQRS (Command Query Responsibility Segregation), and event-driven architectures using NestJS. Your task is to refactor and implement the "user-service" in a microservices-based restaurant reservation system called DatBan. This is the first service in the project, so focus on making it a solid foundation that can be extended to other services like restaurant-service and reservation-service later.
The project uses NestJS 11+ with TypeScript, PostgreSQL as the database, RabbitMQ for events, gRPC for inter-service communication, and Kong as API Gateway. The overall architecture is microservices with event-driven communication.
Project Context:

User Service Responsibilities: Handles user management, authentication, profiles, and basic stats. It publishes events like UserCreated, UserUpdated, UserDeleted, and consumes events like ReservationCompleted for updating user stats.
Database: PostgreSQL with tables like "users" (id, email, password_hash, name, phone, preferences JSONB).
Communication: Publishes domain events to RabbitMQ; exposes gRPC endpoints like GetUser, ValidateUser.
MVP Features for User Service: User registration, login (JWT), profile update, get user details.

Requirements for Implementation:

Apply DDD Principles:

Use Clean/Onion Architecture: Core domain layer (entities, aggregates, value objects, repositories interfaces, use-cases, domain events), Application layer (commands, queries, handlers), Infrastructure layer (DB adapters, messaging), Presentation layer (controllers, DTOs).
Define bounded context: User management as a single context.
Aggregates: User as aggregate root with methods for business rules (e.g., create, updateProfile, validateEmailUnique).
Value Objects: UserPreferences (cuisineTypes, dietaryRestrictions, etc.).
Domain Events: Extend existing ones (UserCreated, UserUpdated) using @nestjs/cqrs.
Repositories: Ports (interfaces) in core, Adapters in infrastructure (using TypeORM).

Apply CQRS:

Separate Commands (write operations: e.g., CreateUserCommand, UpdateUserCommand) and Queries (read operations: e.g., GetUserQuery, GetUserPreferencesQuery).
Use @nestjs/cqrs for CommandHandlers and QueryHandlers.
For writes: Command handlers load aggregates, apply changes, publish events, and persist.
For reads: Query handlers use optimized read models (initially same DB, later denormalized views if needed).
Integrate with event sourcing lightly: Store domain events in a separate table for audit, replay if needed.

Other Strategies:

Event-Driven: Publish domain events to RabbitMQ after commands. Consume relevant events (e.g., from Reservation Service).
Ports and Adapters: Dependency inversion – core depends on abstractions.
Testing: 100% coverage – unit tests for domain/use-cases, integration tests with Testcontainers for DB/RabbitMQ.
Security: JWT auth, password hashing (bcrypt), input validation (class-validator).
Observability: Add OpenTelemetry for tracing, Prometheus metrics (e.g., user creation counter).
Error Handling: Custom exceptions, structured logging.
Performance: Basic caching with Redis for user sessions/preferences.

Project Structure for User Service:
Follow this structure:
textapps/user-service/
├── src/
│ ├── core/ # DDD Domain Layer
│ │ ├── entities/ # Aggregates, Entities, Value Objects (e.g., user.entity.ts)
│ │ ├── repositories/ # Repository ports/interfaces
│ │ ├── use-cases/ # Pure business use-cases
│ │ └── events/ # Domain events (e.g., user-created.event.ts)
│ ├── application/ # CQRS Layer
│ │ ├── commands/ # Commands and handlers (e.g., create-user.command.ts, create-user.handler.ts)
│ │ ├── queries/ # Queries and handlers (e.g., get-user.query.ts, get-user.handler.ts)
│ │ ├── handlers/ # Event handlers for consumed events
│ │ └── dto/ # Input/Output DTOs
│ ├── infrastructure/ # Adapters
│ │ ├── database/ # TypeORM config, entities mapping
│ │ ├── messaging/ # RabbitMQ publishers/consumers
│ │ ├── grpc/ # gRPC server/client
│ │ └── repositories/ # Repository adapters (impl)
│ ├── presentation/ # API Layer
│ │ ├── controllers/ # HTTP controllers
│ │ └── validators/ # DTO validators
│ └── main.ts # Bootstrap
├── proto/ # gRPC protobuf (user.proto)
├── test/ # Tests (unit, integration)
├── Dockerfile
└── package.json
Implementation Steps:

Install dependencies: @nestjs/cqrs, @nestjs/typeorm, typeorm, pg, class-validator, class-transformer, bcrypt, etc.
Bootstrap CQRS in main.ts: Use CqrsModule.
Implement at least 3 commands (CreateUser, UpdateUser, DeleteUser) and 2 queries (GetUser, GetUserPreferences).
Handle events: E.g., on UserCreated, publish to RabbitMQ.
Add gRPC: Implement UserService with GetUser, ValidateUser.
Testing: Write Jest tests for handlers, use-cases.
Documentation: Add Swagger for HTTP endpoints.

Provide the complete refactored code for user-service, including all files mentioned. Use best practices, TypeScript types, and comments. Ensure it's production-ready but focused on MVP. If needed, mock external dependencies for testing. Output the code in a structured format with file paths.
