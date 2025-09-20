import { IEvent } from '@nestjs/cqrs';

export class UserCreatedEvent implements IEvent {
  constructor(
    public readonly user: {
      id: string;
      email: string;
      name: string;
      phone: string;
      preferences: any;
      createdAt: Date;
      isActive: boolean;
    },
  ) {}

  // Event metadata
  static readonly eventName = 'user.created';
  static readonly eventVersion = '1.0.0';

  toPayload(): Record<string, unknown> {
    return {
      eventName: UserCreatedEvent.eventName,
      eventVersion: UserCreatedEvent.eventVersion,
      aggregateId: this.user.id,
      aggregateType: 'User',
      payload: {
        userId: this.user.id,
        email: this.user.email,
        name: this.user.name,
        phone: this.user.phone,
        preferences: this.user.preferences as Record<string, unknown>,
        createdAt: this.user.createdAt,
        isActive: this.user.isActive,
      },
      occurredAt: new Date(),
    };
  }
}
