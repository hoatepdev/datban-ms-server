import { AggregateRoot } from '@nestjs/cqrs';
import { UserCreatedEvent } from '../events/user-created.event';
import { UserUpdatedEvent } from '../events/user-updated.event';
import { UserDeletedEvent } from '../events/user-deleted.event';
import {
  UserPreferences,
  UserPreferencesProps,
} from './user-preferences.value-object';

export interface UserSnapshot {
  id: string;
  email: string;
  name: string;
  phone: string;
  preferences: UserPreferencesProps;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export class User extends AggregateRoot {
  constructor(
    private readonly _id: string,
    private _email: string,
    private _passwordHash: string,
    private _name: string,
    private _phone: string,
    private _preferences: UserPreferences,
    private _createdAt: Date = new Date(),
    private _updatedAt: Date = new Date(),
    private _isActive: boolean = true,
  ) {
    super();
  }

  // Factory method for creating new users
  static create(
    id: string,
    email: string,
    passwordHash: string,
    name: string,
    phone: string,
    preferences?: UserPreferences,
  ): User {
    const user = new User(
      id,
      email,
      passwordHash,
      name,
      phone,
      preferences || UserPreferences.default(),
    );

    // Apply domain event
    user.apply(new UserCreatedEvent(user.toSnapshot()));
    return user;
  }

  // Business methods
  updateProfile(
    name: string,
    phone: string,
    preferences?: UserPreferences,
  ): void {
    this.validateUpdate(name, phone);

    const oldSnapshot = this.toSnapshot();
    this._name = name;
    this._phone = phone;
    if (preferences) {
      this._preferences = preferences;
    }
    this._updatedAt = new Date();

    this.apply(new UserUpdatedEvent(oldSnapshot, this.toSnapshot()));
  }

  updatePreferences(preferences: UserPreferences): void {
    this._preferences = preferences;
    this._updatedAt = new Date();
  }

  changeEmail(newEmail: string): void {
    if (!this.isValidEmail(newEmail)) {
      throw new Error('Invalid email format');
    }

    const oldEmail = this._email;
    this._email = newEmail;
    this._updatedAt = new Date();

    this.apply(
      new UserUpdatedEvent(
        { ...this.toSnapshot(), email: oldEmail },
        this.toSnapshot(),
      ),
    );
  }

  changePassword(newPasswordHash: string): void {
    this._passwordHash = newPasswordHash;
    this._updatedAt = new Date();
  }

  deactivate(): void {
    if (!this._isActive) {
      throw new Error('User is already deactivated');
    }

    this._isActive = false;
    this._updatedAt = new Date();

    this.apply(new UserDeletedEvent(this._id, this._email));
  }

  activate(): void {
    this._isActive = true;
    this._updatedAt = new Date();
  }

  // Validation methods
  private validateUpdate(name: string, phone: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('Name cannot be empty');
    }

    if (!phone || !this.isValidPhone(phone)) {
      throw new Error('Invalid phone number');
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s\-()]{10,}$/;
    return phoneRegex.test(phone);
  }

  // Getters
  get id(): string {
    return this._id;
  }

  get email(): string {
    return this._email;
  }

  get passwordHash(): string {
    return this._passwordHash;
  }

  get name(): string {
    return this._name;
  }

  get phone(): string {
    return this._phone;
  }

  get preferences(): UserPreferences {
    return this._preferences;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  // Snapshot for event sourcing
  toSnapshot(): UserSnapshot {
    return {
      id: this._id,
      email: this._email,
      name: this._name,
      phone: this._phone,
      preferences: this._preferences.toPlain(),
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      isActive: this._isActive,
    };
  }

  // Method required by AggregateRoot
  markEventsAsCommitted(): void {
    this.commit();
  }

  // Restore from snapshot
  static fromSnapshot(snapshot: UserSnapshot & { passwordHash: string }): User {
    const user = new User(
      snapshot.id,
      snapshot.email,
      snapshot.passwordHash || '',
      snapshot.name,
      snapshot.phone,
      UserPreferences.fromPlain(snapshot.preferences),
      snapshot.createdAt,
      snapshot.updatedAt,
      snapshot.isActive,
    );
    // Don't apply events when restoring from snapshot
    user.markEventsAsCommitted();
    return user;
  }
}
