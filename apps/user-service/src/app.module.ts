import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

// Infrastructure
import { databaseConfig } from './infrastructure/config/database.config';
import { DomainEventTypeormEntity } from './infrastructure/database/entities/domain-event.typeorm-entity';
import { UserTypeormEntity } from './infrastructure/database/entities/user.typeorm-entity';
import { UserRepository } from './infrastructure/repositories/user.repository';

// Core
import { USER_REPOSITORY } from './core/repositories/user.repository.interface';
import { AuthService } from './core/services/auth.service';
import { CreateUserUseCase } from './core/use-cases/create-user.use-case';

// Application - Commands
import { ChangePasswordHandler } from './application/commands/handlers/change-password.handler';
import { CreateUserHandler } from './application/commands/handlers/create-user.handler';
import { DeleteUserHandler } from './application/commands/handlers/delete-user.handler';
import { LoginUserHandler } from './application/commands/handlers/login-user.handler';
import { RefreshTokenHandler } from './application/commands/handlers/refresh-token.handler';
import { UpdateUserHandler } from './application/commands/handlers/update-user.handler';

// Application - Queries
import { GetUserPreferencesHandler } from './application/queries/handlers/get-user-preferences.handler';
import { GetUserHandler } from './application/queries/handlers/get-user.handler';

// Presentation
import { AuthController } from './presentation/controllers/auth.controller';
import { UserController } from './presentation/controllers/user.controller';

const CommandHandlers = [
  CreateUserHandler,
  UpdateUserHandler,
  DeleteUserHandler,
  LoginUserHandler,
  RefreshTokenHandler,
  ChangePasswordHandler,
];

const QueryHandlers = [GetUserHandler, GetUserPreferencesHandler];

const EventHandlers = [
  // TODO: Add event handlers for consumed events
];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
    }),
    TypeOrmModule.forRoot(databaseConfig),
    TypeOrmModule.forFeature([UserTypeormEntity, DomainEventTypeormEntity]),
    CqrsModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default-secret',
      signOptions: {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
        issuer: 'datban-user-service',
      },
    }),
  ],
  controllers: [UserController, AuthController],
  providers: [
    // Use cases
    CreateUserUseCase,

    // Services
    AuthService,

    // Repositories
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },

    // CQRS Handlers
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,
  ],
})
export class AppModule {}
