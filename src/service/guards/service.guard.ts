import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class VendorGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    return request.user.role === 'vendor';
  }
}
