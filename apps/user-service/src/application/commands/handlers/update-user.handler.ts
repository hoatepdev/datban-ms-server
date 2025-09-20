import { Inject, Logger, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserPreferences } from '../../../core/entities/user-preferences.value-object';
import type { IUserRepository } from '../../../core/repositories/user.repository.interface';
import { USER_REPOSITORY } from '../../../core/repositories/user.repository.interface';
import { UpdateUserCommand } from '../update-user.command';

@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand> {
  private readonly logger = new Logger(UpdateUserHandler.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(command: UpdateUserCommand): Promise<void> {
    this.logger.log(`Updating user with ID: ${command.userId}`);

    try {
      // Load user aggregate
      const user = await this.userRepository.findById(command.userId);
      if (!user) {
        throw new NotFoundException(`User with ID ${command.userId} not found`);
      }

      // Create preferences value object if provided
      const preferences = command.preferences
        ? UserPreferences.fromPlain(
            command.preferences as Record<string, unknown>,
          )
        : undefined;

      // Apply business logic
      user.updateProfile(command.name, command.phone, preferences);

      // Save changes
      await this.userRepository.save(user);

      this.logger.log(`User updated successfully: ${command.userId}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to update user: ${errorMessage}`, errorStack);
      throw error;
    }
  }
}
