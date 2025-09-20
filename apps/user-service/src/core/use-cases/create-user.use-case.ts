import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { UserPreferences } from '../entities/user-preferences.value-object';
import { User } from '../entities/user.entity';
import type { IUserRepository } from '../repositories/user.repository.interface';
import { USER_REPOSITORY } from '../repositories/user.repository.interface';

export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  phone: string;
  preferences?: any;
}

export interface CreateUserResponse {
  id: string;
  email: string;
  name: string;
  phone: string;
  preferences: any;
  createdAt: Date;
}

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(request: CreateUserRequest): Promise<CreateUserResponse> {
    // Validate business rules
    await this.validateUniqueEmail(request.email);

    // Hash password
    const passwordHash = await this.hashPassword(request.password);

    // Create preferences value object
    const preferences = request.preferences
      ? UserPreferences.fromPlain(
          request.preferences as Record<string, unknown>,
        )
      : UserPreferences.default();

    // Create user aggregate
    const user = User.create(
      uuidv4(),
      request.email.toLowerCase().trim(),
      passwordHash,
      request.name.trim(),
      request.phone.trim(),
      preferences,
    );

    // Save user
    await this.userRepository.save(user);

    // Return response
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      preferences: user.preferences.toPlain(),
      createdAt: user.createdAt,
    };
  }

  private async validateUniqueEmail(email: string): Promise<void> {
    const exists = await this.userRepository.existsByEmail(
      email.toLowerCase().trim(),
    );
    if (exists) {
      throw new Error('Email already exists');
    }
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }
}
