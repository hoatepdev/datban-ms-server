import { User } from './user.entity';
import { UserPreferences } from './user-preferences.value-object';
import { UserCreatedEvent } from '../events/user-created.event';
import { UserUpdatedEvent } from '../events/user-updated.event';
import { UserDeletedEvent } from '../events/user-deleted.event';

describe('User Entity', () => {
  const mockId = '123e4567-e89b-12d3-a456-426614174000';
  const mockEmail = 'test@example.com';
  const mockPasswordHash = 'hashedPassword123';
  const mockName = 'John Doe';
  const mockPhone = '+1234567890';
  const mockPreferences = UserPreferences.default();

  describe('User.create', () => {
    it('should create a new user with valid data', () => {
      const user = User.create(
        mockId,
        mockEmail,
        mockPasswordHash,
        mockName,
        mockPhone,
        mockPreferences,
      );

      expect(user.id).toBe(mockId);
      expect(user.email).toBe(mockEmail);
      expect(user.name).toBe(mockName);
      expect(user.phone).toBe(mockPhone);
      expect(user.isActive).toBe(true);
      expect(user.preferences).toBe(mockPreferences);
    });

    it('should apply UserCreatedEvent when creating user', () => {
      const user = User.create(
        mockId,
        mockEmail,
        mockPasswordHash,
        mockName,
        mockPhone,
        mockPreferences,
      );

      const events = user.getUncommittedEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(UserCreatedEvent);
    });

    it('should use default preferences when none provided', () => {
      const user = User.create(
        mockId,
        mockEmail,
        mockPasswordHash,
        mockName,
        mockPhone,
      );

      expect(user.preferences.language).toBe('en');
      expect(user.preferences.timezone).toBe('UTC');
    });
  });

  describe('updateProfile', () => {
    let user: User;

    beforeEach(() => {
      user = User.create(
        mockId,
        mockEmail,
        mockPasswordHash,
        mockName,
        mockPhone,
        mockPreferences,
      );

      user.markEventsAsCommitted(); // Clear creation event
    });

    it('should update user profile successfully', () => {
      const newName = 'Jane Smith';
      const newPhone = '+0987654321';

      user.updateProfile(newName, newPhone);

      expect(user.name).toBe(newName);
      expect(user.phone).toBe(newPhone);
    });

    it('should apply UserUpdatedEvent when updating profile', () => {
      const newName = 'Jane Smith';
      const newPhone = '+0987654321';

      user.updateProfile(newName, newPhone);

      const events = user.getUncommittedEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(UserUpdatedEvent);
    });

    it('should throw error for empty name', () => {
      expect(() => {
        user.updateProfile('', mockPhone);
      }).toThrow('Name cannot be empty');
    });

    it('should throw error for invalid phone', () => {
      expect(() => {
        user.updateProfile(mockName, 'invalid');
      }).toThrow('Invalid phone number');
    });
  });

  describe('changeEmail', () => {
    let user: User;

    beforeEach(() => {
      user = User.create(
        mockId,
        mockEmail,
        mockPasswordHash,
        mockName,
        mockPhone,
        mockPreferences,
      );

      user.markEventsAsCommitted();
    });

    it('should change email successfully', () => {
      const newEmail = 'newemail@example.com';

      user.changeEmail(newEmail);

      expect(user.email).toBe(newEmail);
    });

    it('should throw error for invalid email format', () => {
      expect(() => {
        user.changeEmail('invalid-email');
      }).toThrow('Invalid email format');
    });
  });

  describe('deactivate', () => {
    let user: User;

    beforeEach(() => {
      user = User.create(
        mockId,
        mockEmail,
        mockPasswordHash,
        mockName,
        mockPhone,
        mockPreferences,
      );

      user.markEventsAsCommitted();
    });

    it('should deactivate user successfully', () => {
      user.deactivate();

      expect(user.isActive).toBe(false);
    });

    it('should apply UserDeletedEvent when deactivating', () => {
      user.deactivate();

      const events = user.getUncommittedEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(UserDeletedEvent);
    });

    it('should throw error when deactivating already inactive user', () => {
      user.deactivate();

      expect(() => {
        user.deactivate();
      }).toThrow('User is already deactivated');
    });
  });

  describe('toSnapshot and fromSnapshot', () => {
    it('should create snapshot and restore correctly', () => {
      const user = User.create(
        mockId,
        mockEmail,
        mockPasswordHash,
        mockName,
        mockPhone,
        mockPreferences,
      );

      const snapshot = user.toSnapshot();
      const restoredUser = User.fromSnapshot({
        ...snapshot,
        passwordHash: mockPasswordHash,
      });

      expect(restoredUser.id).toBe(user.id);
      expect(restoredUser.email).toBe(user.email);
      expect(restoredUser.name).toBe(user.name);
      expect(restoredUser.phone).toBe(user.phone);
      expect(restoredUser.isActive).toBe(user.isActive);
    });
  });
});
