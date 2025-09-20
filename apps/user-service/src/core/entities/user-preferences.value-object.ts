export interface UserPreferencesProps extends Record<string, unknown> {
  cuisineTypes: string[];
  dietaryRestrictions: string[];
  priceRange: {
    min: number;
    max: number;
  };
  preferredLocations: string[];
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  language: string;
  timezone: string;
}

export class UserPreferences {
  private constructor(private readonly props: UserPreferencesProps) {
    this.validate();
  }

  static create(props: UserPreferencesProps): UserPreferences {
    return new UserPreferences(props);
  }

  static default(): UserPreferences {
    return new UserPreferences({
      cuisineTypes: [],
      dietaryRestrictions: [],
      priceRange: { min: 0, max: 1000 },
      preferredLocations: [],
      notifications: {
        email: true,
        sms: false,
        push: true,
      },
      language: 'en',
      timezone: 'UTC',
    });
  }

  static fromPlain(plain: Record<string, unknown>): UserPreferences {
    return new UserPreferences({
      cuisineTypes: (plain.cuisineTypes as string[]) || [],
      dietaryRestrictions: (plain.dietaryRestrictions as string[]) || [],
      priceRange: (plain.priceRange as { min: number; max: number }) || {
        min: 0,
        max: 1000,
      },
      preferredLocations: (plain.preferredLocations as string[]) || [],
      notifications: (plain.notifications as {
        email: boolean;
        sms: boolean;
        push: boolean;
      }) || {
        email: true,
        sms: false,
        push: true,
      },
      language: (plain.language as string) || 'en',
      timezone: (plain.timezone as string) || 'UTC',
    });
  }

  private validate(): void {
    if (this.props.priceRange.min < 0) {
      throw new Error('Minimum price cannot be negative');
    }

    if (this.props.priceRange.max < this.props.priceRange.min) {
      throw new Error('Maximum price cannot be less than minimum price');
    }

    if (!this.props.language || this.props.language.trim().length === 0) {
      throw new Error('Language cannot be empty');
    }

    if (!this.props.timezone || this.props.timezone.trim().length === 0) {
      throw new Error('Timezone cannot be empty');
    }
  }

  // Getters
  get cuisineTypes(): string[] {
    return [...this.props.cuisineTypes];
  }

  get dietaryRestrictions(): string[] {
    return [...this.props.dietaryRestrictions];
  }

  get priceRange(): { min: number; max: number } {
    return { ...this.props.priceRange };
  }

  get preferredLocations(): string[] {
    return [...this.props.preferredLocations];
  }

  get notifications(): { email: boolean; sms: boolean; push: boolean } {
    return { ...this.props.notifications };
  }

  get language(): string {
    return this.props.language;
  }

  get timezone(): string {
    return this.props.timezone;
  }

  // Methods
  addCuisineType(cuisineType: string): UserPreferences {
    if (this.props.cuisineTypes.includes(cuisineType)) {
      return this;
    }

    return new UserPreferences({
      ...this.props,
      cuisineTypes: [...this.props.cuisineTypes, cuisineType],
    });
  }

  removeCuisineType(cuisineType: string): UserPreferences {
    return new UserPreferences({
      ...this.props,
      cuisineTypes: this.props.cuisineTypes.filter(
        (type) => type !== cuisineType,
      ),
    });
  }

  addDietaryRestriction(restriction: string): UserPreferences {
    if (this.props.dietaryRestrictions.includes(restriction)) {
      return this;
    }

    return new UserPreferences({
      ...this.props,
      dietaryRestrictions: [...this.props.dietaryRestrictions, restriction],
    });
  }

  removeDietaryRestriction(restriction: string): UserPreferences {
    return new UserPreferences({
      ...this.props,
      dietaryRestrictions: this.props.dietaryRestrictions.filter(
        (r) => r !== restriction,
      ),
    });
  }

  updatePriceRange(min: number, max: number): UserPreferences {
    return new UserPreferences({
      ...this.props,
      priceRange: { min, max },
    });
  }

  updateNotifications(
    notifications: Partial<{ email: boolean; sms: boolean; push: boolean }>,
  ): UserPreferences {
    return new UserPreferences({
      ...this.props,
      notifications: {
        ...this.props.notifications,
        ...notifications,
      },
    });
  }

  updateLanguage(language: string): UserPreferences {
    return new UserPreferences({
      ...this.props,
      language,
    });
  }

  updateTimezone(timezone: string): UserPreferences {
    return new UserPreferences({
      ...this.props,
      timezone,
    });
  }

  // Equality
  equals(other: UserPreferences): boolean {
    return JSON.stringify(this.props) === JSON.stringify(other.props);
  }

  // Serialization
  toPlain(): UserPreferencesProps {
    return {
      cuisineTypes: [...this.props.cuisineTypes],
      dietaryRestrictions: [...this.props.dietaryRestrictions],
      priceRange: { ...this.props.priceRange },
      preferredLocations: [...this.props.preferredLocations],
      notifications: { ...this.props.notifications },
      language: this.props.language,
      timezone: this.props.timezone,
    };
  }
}
