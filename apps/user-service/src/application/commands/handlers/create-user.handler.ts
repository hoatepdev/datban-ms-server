import { Logger } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import {
  CreateUserResponse,
  CreateUserUseCase,
} from '../../../core/use-cases/create-user.use-case';
import { CreateUserCommand } from '../create-user.command';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  private readonly logger = new Logger(CreateUserHandler.name);

  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CreateUserCommand): Promise<CreateUserResponse> {
    this.logger.log(`Creating user with email: ${command.email}`);
    try {
      const result = await this.createUserUseCase.execute({
        email: command.email,
        password: command.password,
        name: command.name,
        phone: command.phone,
        preferences: command.preferences as unknown,
      });

      this.logger.log(`User created successfully with ID: ${result.id}`);

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to create user: ${errorMessage}`, errorStack);
      throw error;
    }
  }
}
