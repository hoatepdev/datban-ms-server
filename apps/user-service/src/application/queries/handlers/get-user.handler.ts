import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetUserQuery } from '../get-user.query';
import type { IUserRepository } from '../../../core/repositories/user.repository.interface';
import { USER_REPOSITORY } from '../../../core/repositories/user.repository.interface';
import { Inject, Logger, NotFoundException } from '@nestjs/common';

export interface GetUserResponse {
  id: string;
  email: string;
  name: string;
  phone: string;
  preferences: any;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

@QueryHandler(GetUserQuery)
export class GetUserHandler implements IQueryHandler<GetUserQuery> {
  private readonly logger = new Logger(GetUserHandler.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(query: GetUserQuery): Promise<GetUserResponse> {
    this.logger.log(`Getting user with ID: ${query.userId}`);

    const user = await this.userRepository.findById(query.userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${query.userId} not found`);
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      preferences: user.preferences.toPlain(),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      isActive: user.isActive,
    };
  }
}
