import { Inject, Logger, UnauthorizedException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import * as bcrypt from 'bcrypt';
import type { IUserRepository } from '../../../core/repositories/user.repository.interface';
import { USER_REPOSITORY } from '../../../core/repositories/user.repository.interface';
import { AuthService } from '../../../core/services/auth.service';
import { LoginUserCommand } from '../login-user.command';

export interface LoginUserResponse {
  user: {
    id: string;
    email: string;
    name: string;
    phone: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

@CommandHandler(LoginUserCommand)
export class LoginUserHandler implements ICommandHandler<LoginUserCommand> {
  private readonly logger = new Logger(LoginUserHandler.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly authService: AuthService,
  ) {}

  async execute(command: LoginUserCommand): Promise<LoginUserResponse> {
    this.logger.log(`Login attempt for email: ${command.email}`);

    try {
      // Find user by email
      const user = await this.userRepository.findByEmail(command.email);
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Check if user is active
      if (!user.isActive) {
        throw new UnauthorizedException('Account is deactivated');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(
        command.password,
        user.passwordHash,
      );
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Generate tokens
      const tokens = await this.authService.generateTokens(user);

      // Update last login timestamp
      await this.userRepository.updateUserStats(user.id, {
        lastLoginAt: new Date(),
      });

      this.logger.log(`User logged in successfully: ${user.id}`);

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
        },
        tokens,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Login failed for email ${command.email}: ${errorMessage}`,
      );
      throw error;
    }
  }
}
