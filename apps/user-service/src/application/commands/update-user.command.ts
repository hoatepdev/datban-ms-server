import { ICommand } from '@nestjs/cqrs';

export class UpdateUserCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly name: string,
    public readonly phone: string,
    public readonly preferences?: any,
  ) {}
}
