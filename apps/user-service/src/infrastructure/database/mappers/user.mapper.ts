import { UserPreferences } from '../../../core/entities/user-preferences.value-object';
import { User } from '../../../core/entities/user.entity';
import { UserTypeormEntity } from '../entities/user.typeorm-entity';

export class UserMapper {
  static toDomain(typeormEntity: UserTypeormEntity): User {
    const preferences = typeormEntity.preferences
      ? UserPreferences.fromPlain(
          typeormEntity.preferences as Record<string, unknown>,
        )
      : UserPreferences.default();

    return new User(
      typeormEntity.id,
      typeormEntity.email,
      typeormEntity.passwordHash,
      typeormEntity.name,
      typeormEntity.phone,
      preferences,
      typeormEntity.createdAt,
      typeormEntity.updatedAt,
      typeormEntity.isActive,
    );
  }

  static toPersistence(domainEntity: User): UserTypeormEntity {
    const typeormEntity = new UserTypeormEntity();

    typeormEntity.id = domainEntity.id;
    typeormEntity.email = domainEntity.email;
    typeormEntity.passwordHash = domainEntity.passwordHash;
    typeormEntity.name = domainEntity.name;
    typeormEntity.phone = domainEntity.phone;
    typeormEntity.preferences = domainEntity.preferences.toPlain();
    typeormEntity.createdAt = domainEntity.createdAt;
    typeormEntity.updatedAt = domainEntity.updatedAt;
    typeormEntity.isActive = domainEntity.isActive;

    return typeormEntity;
  }

  static toDomainList(typeormEntities: UserTypeormEntity[]): User[] {
    return typeormEntities.map((entity) => this.toDomain(entity));
  }
}
