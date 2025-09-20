import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetUserPreferencesQuery } from '../get-user-preferences.query';
import type { IUserRepository } from '../../../core/repositories/user.repository.interface';
import { USER_REPOSITORY } from '../../../core/repositories/user.repository.interface';
import { Inject, Logger, NotFoundException } from '@nestjs/common';

export interface GetUserPreferencesResponse {
  userId: string;
  preferences: {
    cuisineTypes: string[];
    dietaryRestrictions: string[];
    priceRange: {
      min: number;
      max: number;
    };
    preferredLocations: string[];
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    language: string;
    timezone: string;
  };
}

@QueryHandler(GetUserPreferencesQuery)
export class GetUserPreferencesHandler
  implements IQueryHandler<GetUserPreferencesQuery>
{
  private readonly logger = new Logger(GetUserPreferencesHandler.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(
    query: GetUserPreferencesQuery,
  ): Promise<GetUserPreferencesResponse> {
    this.logger.log(`Getting preferences for user ID: ${query.userId}`);

    const user = await this.userRepository.findById(query.userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${query.userId} not found`);
    }

    return {
      userId: user.id,
      preferences: user.preferences.toPlain(),
    };
  }
}
