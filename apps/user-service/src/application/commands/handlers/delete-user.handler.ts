import { Inject, Logger, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import type { IUserRepository } from '../../../core/repositories/user.repository.interface';
import { USER_REPOSITORY } from '../../../core/repositories/user.repository.interface';
import { DeleteUserCommand } from '../delete-user.command';

@CommandHandler(DeleteUserCommand)
export class DeleteUserHandler implements ICommandHandler<DeleteUserCommand> {
  private readonly logger = new Logger(DeleteUserHandler.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(command: DeleteUserCommand): Promise<void> {
    this.logger.log(`Deleting user with ID: ${command.userId}`);

    try {
      // Load user aggregate
      const user = await this.userRepository.findById(command.userId);
      if (!user) {
        throw new NotFoundException(`User with ID ${command.userId} not found`);
      }

      // Apply business logic (soft delete)
      user.deactivate();

      // Save changes
      await this.userRepository.save(user);

      this.logger.log(`User deleted successfully: ${command.userId}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to delete user: ${errorMessage}`, errorStack);
      throw error;
    }
  }
}
