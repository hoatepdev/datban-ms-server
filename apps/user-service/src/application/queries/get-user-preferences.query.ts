import { IQuery } from '@nestjs/cqrs';

export class GetUserPreferencesQuery implements IQuery {
  constructor(public readonly userId: string) {}
}
