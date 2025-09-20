import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../entities/user.entity';
import { v4 as uuidv4 } from 'uuid';

export interface TokenPayload {
  sub: string; // user id
  email: string;
  name: string;
  iat?: number;
  exp?: number;
  jti?: string; // token id for tracking
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly jwtService: JwtService) {}

  async generateTokens(user: User): Promise<AuthTokens> {
    const tokenId = uuidv4();

    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      jti: tokenId,
    };

    // Generate access token (short-lived)
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
      secret: process.env.JWT_SECRET,
    });

    // Generate refresh token (long-lived)
    const refreshToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        type: 'refresh',
        jti: tokenId,
      },
      {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
        secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      },
    );

    this.logger.log(`Generated tokens for user: ${user.id}`);

    return {
      accessToken,
      refreshToken,
    };
  }

  async verifyAccessToken(token: string): Promise<TokenPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<TokenPayload>(token, {
        secret: process.env.JWT_SECRET,
      });

      return payload;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Access token verification failed: ${errorMessage}`);
      throw error;
    }
  }

  async verifyRefreshToken(
    token: string,
  ): Promise<{ sub: string; jti: string }> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (payload.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      return {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        sub: payload.sub,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        jti: payload.jti,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Refresh token verification failed: ${errorMessage}`);
      throw error;
    }
  }

  async generatePasswordResetToken(userId: string): Promise<string> {
    const payload = {
      sub: userId,
      type: 'password-reset',
      jti: uuidv4(),
    };

    return this.jwtService.signAsync(payload, {
      expiresIn: '1h', // Password reset tokens expire quickly
      secret: process.env.JWT_SECRET,
    });
  }

  async verifyPasswordResetToken(token: string): Promise<{ sub: string }> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (payload.type !== 'password-reset') {
        throw new Error('Invalid token type');
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      return { sub: payload.sub };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Password reset token verification failed: ${errorMessage}`,
      );
      throw error;
    }
  }

  extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader) {
      return null;
    }

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : null;
  }
}
