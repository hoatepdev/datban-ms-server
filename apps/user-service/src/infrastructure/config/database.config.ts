import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DomainEventTypeormEntity } from '../database/entities/domain-event.typeorm-entity';
import { UserTypeormEntity } from '../database/entities/user.typeorm-entity';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USERNAME || 'datban_user',
  password: process.env.DATABASE_PASSWORD || 'datban_password',
  database: process.env.DATABASE_NAME || 'datban_users',
  entities: [UserTypeormEntity, DomainEventTypeormEntity],
  synchronize: process.env.NODE_ENV !== 'production', // Only for development
  logging: process.env.NODE_ENV === 'development',
  migrations: ['dist/infrastructure/database/migrations/*.js'],
  migrationsTableName: 'migrations',
};
