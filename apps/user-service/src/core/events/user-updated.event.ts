import { IEvent } from '@nestjs/cqrs';
import { UserSnapshot } from '../entities/user.entity';

export class UserUpdatedEvent implements IEvent {
  constructor(
    public readonly previousState: UserSnapshot,
    public readonly currentState: UserSnapshot,
  ) {}

  static readonly eventName = 'user.updated';
  static readonly eventVersion = '1.0.0';

  toPayload(): Record<string, unknown> {
    return {
      eventName: UserUpdatedEvent.eventName,
      eventVersion: UserUpdatedEvent.eventVersion,
      aggregateId: this.currentState.id,
      aggregateType: 'User',
      payload: {
        userId: this.currentState.id,
        previousState: {
          email: this.previousState.email,
          name: this.previousState.name,
          phone: this.previousState.phone,
          preferences: this.previousState.preferences,
          updatedAt: this.previousState.updatedAt,
        },
        currentState: {
          email: this.currentState.email,
          name: this.currentState.name,
          phone: this.currentState.phone,
          preferences: this.currentState.preferences,
          updatedAt: this.currentState.updatedAt,
        },
        changes: this.getChanges(),
      },
      occurredAt: new Date(),
    };
  }

  private getChanges(): Record<string, { from: unknown; to: unknown }> {
    const changes: Record<string, { from: unknown; to: unknown }> = {};

    const fieldsToCheck: (keyof UserSnapshot)[] = [
      'email',
      'name',
      'phone',
      'preferences',
    ];

    fieldsToCheck.forEach((field) => {
      if (
        JSON.stringify(this.previousState[field]) !==
        JSON.stringify(this.currentState[field])
      ) {
        changes[field] = {
          from: this.previousState[field],
          to: this.currentState[field],
        };
      }
    });

    return changes;
  }
}
