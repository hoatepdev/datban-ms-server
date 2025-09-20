import { User } from '../entities/user.entity';

export interface IUserRepository {
  /**
   * Save a user aggregate
   */
  save(user: User): Promise<void>;

  /**
   * Find user by ID
   */
  findById(id: string): Promise<User | null>;

  /**
   * Find user by email
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Check if email already exists
   */
  existsByEmail(email: string): Promise<boolean>;

  /**
   * Find users by multiple IDs
   */
  findByIds(ids: string[]): Promise<User[]>;

  /**
   * Find all active users with pagination
   */
  findAllActive(
    limit?: number,
    offset?: number,
  ): Promise<{
    users: User[];
    total: number;
  }>;

  /**
   * Search users by name or email
   */
  search(
    query: string,
    limit?: number,
    offset?: number,
  ): Promise<{
    users: User[];
    total: number;
  }>;

  /**
   * Delete user by ID (soft delete - mark as inactive)
   */
  deleteById(id: string): Promise<void>;

  /**
   * Get user statistics
   */
  getUserStats(userId: string): Promise<{
    totalReservations: number;
    activeReservations: number;
    cancelledReservations: number;
    joinedAt: Date;
    lastLoginAt?: Date;
  }>;

  /**
   * Update user statistics (called from event handlers)
   */
  updateUserStats(
    userId: string,
    stats: Partial<{
      totalReservations: number;
      activeReservations: number;
      cancelledReservations: number;
      lastLoginAt: Date;
    }>,
  ): Promise<void>;
}

// Token for dependency injection
export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
