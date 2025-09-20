import { ICommand } from '@nestjs/cqrs';

export class LoginUserCommand implements ICommand {
  constructor(
    public readonly email: string,
    public readonly password: string,
  ) {}
}
