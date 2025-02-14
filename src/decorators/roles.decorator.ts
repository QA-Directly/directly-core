import { SetMetadata } from '@nestjs/common';

export const Roles = (...roles: ('user' | 'admin')[]) =>
  SetMetadata('roles', roles);
