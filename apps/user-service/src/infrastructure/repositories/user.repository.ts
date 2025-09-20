import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { User } from '../../core/entities/user.entity';
import { IUserRepository } from '../../core/repositories/user.repository.interface';
import { UserTypeormEntity } from '../database/entities/user.typeorm-entity';
import { UserMapper } from '../database/mappers/user.mapper';

@Injectable()
export class UserRepository implements IUserRepository {
  private readonly logger = new Logger(UserRepository.name);

  constructor(
    @InjectRepository(UserTypeormEntity)
    private readonly userRepository: Repository<UserTypeormEntity>,
  ) {}

  async save(user: User): Promise<void> {
    this.logger.log(`Saving user: ${user.id}`);

    const typeormEntity = UserMapper.toPersistence(user);
    await this.userRepository.save(typeormEntity);

    this.logger.log(`User saved successfully: ${user.id}`);
  }

  async findById(id: string): Promise<User | null> {
    this.logger.log(`Finding user by ID: ${id}`);

    const typeormEntity = await this.userRepository.findOne({
      where: { id },
    });

    if (!typeormEntity) {
      this.logger.log(`User not found: ${id}`);
      return null;
    }

    return UserMapper.toDomain(typeormEntity);
  }

  async findByEmail(email: string): Promise<User | null> {
    this.logger.log(`Finding user by email: ${email}`);

    const typeormEntity = await this.userRepository.findOne({
      where: { email: email.toLowerCase() },
    });

    if (!typeormEntity) {
      this.logger.log(`User not found with email: ${email}`);
      return null;
    }

    return UserMapper.toDomain(typeormEntity);
  }

  async existsByEmail(email: string): Promise<boolean> {
    this.logger.log(`Checking if email exists: ${email}`);

    const count = await this.userRepository.count({
      where: { email: email.toLowerCase() },
    });

    return count > 0;
  }

  async findByIds(ids: string[]): Promise<User[]> {
    this.logger.log(`Finding users by IDs: ${ids.join(', ')}`);

    if (ids.length === 0) {
      return [];
    }

    const typeormEntities = await this.userRepository.findByIds(ids);
    return UserMapper.toDomainList(typeormEntities);
  }

  async findAllActive(
    limit = 20,
    offset = 0,
  ): Promise<{
    users: User[];
    total: number;
  }> {
    this.logger.log(
      `Finding active users with limit: ${limit}, offset: ${offset}`,
    );

    const [typeormEntities, total] = await this.userRepository.findAndCount({
      where: { isActive: true },
      take: limit,
      skip: offset,
      order: { createdAt: 'DESC' },
    });

    return {
      users: UserMapper.toDomainList(typeormEntities),
      total,
    };
  }

  async search(
    query: string,
    limit = 20,
    offset = 0,
  ): Promise<{
    users: User[];
    total: number;
  }> {
    this.logger.log(`Searching users with query: ${query}`);

    const [typeormEntities, total] = await this.userRepository.findAndCount({
      where: [
        { name: ILike(`%${query}%`), isActive: true },
        { email: ILike(`%${query}%`), isActive: true },
      ],
      take: limit,
      skip: offset,
      order: { createdAt: 'DESC' },
    });

    return {
      users: UserMapper.toDomainList(typeormEntities),
      total,
    };
  }

  async deleteById(id: string): Promise<void> {
    this.logger.log(`Soft deleting user: ${id}`);

    await this.userRepository.update(id, {
      isActive: false,
      updatedAt: new Date(),
    });

    this.logger.log(`User soft deleted: ${id}`);
  }

  async getUserStats(userId: string): Promise<{
    totalReservations: number;
    activeReservations: number;
    cancelledReservations: number;
    joinedAt: Date;
    lastLoginAt?: Date;
  }> {
    this.logger.log(`Getting user stats for: ${userId}`);

    const typeormEntity = await this.userRepository.findOne({
      where: { id: userId },
      select: [
        'totalReservations',
        'activeReservations',
        'cancelledReservations',
        'createdAt',
        'lastLoginAt',
      ],
    });

    if (!typeormEntity) {
      throw new Error(`User not found: ${userId}`);
    }

    return {
      totalReservations: typeormEntity.totalReservations,
      activeReservations: typeormEntity.activeReservations,
      cancelledReservations: typeormEntity.cancelledReservations,
      joinedAt: typeormEntity.createdAt,
      lastLoginAt: typeormEntity.lastLoginAt,
    };
  }

  async updateUserStats(
    userId: string,
    stats: Partial<{
      totalReservations: number;
      activeReservations: number;
      cancelledReservations: number;
      lastLoginAt: Date;
    }>,
  ): Promise<void> {
    this.logger.log(`Updating user stats for: ${userId}`);

    await this.userRepository.update(userId, {
      ...stats,
      updatedAt: new Date(),
    });

    this.logger.log(`User stats updated: ${userId}`);
  }
}
