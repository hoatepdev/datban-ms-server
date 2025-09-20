import {
  Inject,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import * as bcrypt from 'bcrypt';
import type { IUserRepository } from '../../../core/repositories/user.repository.interface';
import { USER_REPOSITORY } from '../../../core/repositories/user.repository.interface';
import { ChangePasswordCommand } from '../change-password.command';

@CommandHandler(ChangePasswordCommand)
export class ChangePasswordHandler
  implements ICommandHandler<ChangePasswordCommand>
{
  private readonly logger = new Logger(ChangePasswordHandler.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(command: ChangePasswordCommand): Promise<void> {
    this.logger.log(`Changing password for user: ${command.userId}`);

    try {
      // Load user aggregate
      const user = await this.userRepository.findById(command.userId);
      if (!user) {
        throw new NotFoundException(`User with ID ${command.userId} not found`);
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(
        command.currentPassword,
        user.passwordHash,
      );
      if (!isCurrentPasswordValid) {
        throw new UnauthorizedException('Current password is incorrect');
      }

      // Hash new password
      const saltRounds = 12;
      const newPasswordHash = await bcrypt.hash(
        command.newPassword,
        saltRounds,
      );

      // Apply business logic
      user.changePassword(newPasswordHash);

      // Save changes
      await this.userRepository.save(user);

      this.logger.log(
        `Password changed successfully for user: ${command.userId}`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to change password: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }
}
