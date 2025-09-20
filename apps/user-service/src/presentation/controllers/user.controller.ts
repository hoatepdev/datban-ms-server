import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateUserCommand } from '../../application/commands/create-user.command';
import { UpdateUserCommand } from '../../application/commands/update-user.command';
import { CreateUserDto } from '../../application/dto/create-user.dto';
import { UpdateUserDto } from '../../application/dto/update-user.dto';
import { GetUserPreferencesQuery } from '../../application/queries/get-user-preferences.query';
import { GetUserQuery } from '../../application/queries/get-user.query';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('Users')
@Controller('api/v1/users')
export class UserController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User successfully created',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        email: { type: 'string', format: 'email' },
        name: { type: 'string' },
        phone: { type: 'string' },
        preferences: { type: 'object' },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - email already exists',
  })
  async register(
    @Body(ValidationPipe) createUserDto: CreateUserDto,
  ): Promise<unknown> {
    const command = new CreateUserCommand(
      createUserDto.email,
      createUserDto.password,
      createUserDto.name,
      createUserDto.phone,
      createUserDto.preferences,
    );

    return this.commandBus.execute(command);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        email: { type: 'string', format: 'email' },
        name: { type: 'string' },
        phone: { type: 'string' },
        preferences: { type: 'object' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        isActive: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async getProfile(@Request() req: { user: { id: string } }): Promise<unknown> {
    const query = new GetUserQuery(req.user.id);
    return this.queryBus.execute(query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async getUserById(@Param('id') id: string): Promise<unknown> {
    const query = new GetUserQuery(id);
    return this.queryBus.execute(query);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({
    status: 204,
    description: 'User profile updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async updateProfile(
    @Request() req: { user: { id: string } },
    @Body(ValidationPipe) updateUserDto: UpdateUserDto,
  ): Promise<unknown> {
    const command = new UpdateUserCommand(
      req.user.id,
      updateUserDto.name,
      updateUserDto.phone,
      updateUserDto.preferences,
    );

    return this.commandBus.execute(command);
  }

  @Get('preferences/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user preferences by ID' })
  @ApiResponse({
    status: 200,
    description: 'User preferences retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', format: 'uuid' },
        preferences: {
          type: 'object',
          properties: {
            cuisineTypes: { type: 'array', items: { type: 'string' } },
            dietaryRestrictions: { type: 'array', items: { type: 'string' } },
            priceRange: {
              type: 'object',
              properties: {
                min: { type: 'number' },
                max: { type: 'number' },
              },
            },
            preferredLocations: { type: 'array', items: { type: 'string' } },
            notifications: {
              type: 'object',
              properties: {
                email: { type: 'boolean' },
                sms: { type: 'boolean' },
                push: { type: 'boolean' },
              },
            },
            language: { type: 'string' },
            timezone: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async getUserPreferences(@Param('id') id: string): Promise<unknown> {
    const query = new GetUserPreferencesQuery(id);
    return this.queryBus.execute(query);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        service: { type: 'string', example: 'user-service' },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  })
  health(): { status: string; service: string; timestamp: string } {
    return {
      status: 'ok',
      service: 'user-service',
      timestamp: new Date().toISOString(),
    };
  }
}
