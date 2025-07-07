import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { verifyRoleAccessToken } from '../../utils/jwt.utils';

@Injectable()
export class RoleAuthGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    let token = this.extractTokenFromHeader(request);
    
    // Fallback to query parameter for email links
    if (!token && request.query.token) {
      token = request.query.token;
    }

    if (!token) {
      throw new UnauthorizedException('No access token provided');
    }

    try {
      const jwtSecret = this.configService.get<string>('jwt.secret', 'default-secret');
      const payload = verifyRoleAccessToken(token, jwtSecret);
      
      // Attach role access info to request
      request.roleAccess = {
        documentId: payload.documentId,
        roleNumber: payload.roleNumber,
      };
      
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
} 