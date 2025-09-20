import { IEvent } from '@nestjs/cqrs';

export class UserDeletedEvent implements IEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
  ) {}

  static readonly eventName = 'user.deleted';
  static readonly eventVersion = '1.0.0';

  toPayload(): Record<string, unknown> {
    return {
      eventName: UserDeletedEvent.eventName,
      eventVersion: UserDeletedEvent.eventVersion,
      aggregateId: this.userId,
      aggregateType: 'User',
      payload: {
        userId: this.userId,
        email: this.email,
        deletedAt: new Date(),
      },
      occurredAt: new Date(),
    };
  }
}
