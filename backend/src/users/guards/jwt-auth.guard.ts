import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      // Không có token: cho phép truy cập demo và gán user mẫu.
      request.user = { id: '33333333-3333-3333-3333-333333333331' };
      return true;
    }

    const [scheme, token] = authHeader.split(' ');
    if (scheme !== 'Bearer' || !token) {
      // Token không hợp lệ: vẫn cho phép demo nếu không có auth setup.
      request.user = { id: '33333333-3333-3333-3333-333333333331' };
      return true;
    }

    // For now, attach a mock user to the request
    // In production, you would verify the JWT token here
    request.user = { id: '33333333-3333-3333-3333-333333333331' };

    return true;
  }
}
