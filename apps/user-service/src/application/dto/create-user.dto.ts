import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsObject,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class UserPreferencesDto {
  @ApiPropertyOptional({
    description: 'Preferred cuisine types',
    example: ['Italian', 'Japanese', 'Mexican'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  cuisineTypes?: string[];

  @ApiPropertyOptional({
    description: 'Dietary restrictions',
    example: ['vegetarian', 'gluten-free'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dietaryRestrictions?: string[];

  @ApiPropertyOptional({
    description: 'Price range preferences',
    example: { min: 20, max: 100 },
  })
  @IsOptional()
  @IsObject()
  priceRange?: {
    min: number;
    max: number;
  };

  @ApiPropertyOptional({
    description: 'Preferred locations',
    example: ['Downtown', 'City Center'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredLocations?: string[];

  @ApiPropertyOptional({
    description: 'Notification preferences',
    example: { email: true, sms: false, push: true },
  })
  @IsOptional()
  @IsObject()
  notifications?: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };

  @ApiPropertyOptional({
    description: 'Preferred language',
    example: 'en',
  })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({
    description: 'User timezone',
    example: 'America/New_York',
  })
  @IsOptional()
  @IsString()
  timezone?: string;
}

export class CreateUserDto {
  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'StrongPassword123!',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
  })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({
    description: 'User phone number',
    example: '+1234567890',
  })
  @IsString()
  phone: string;

  @ApiPropertyOptional({
    description: 'User preferences',
    type: 'object',
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject()
  preferences?: UserPreferencesDto;
}
