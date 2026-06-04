import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { ROLES_KEY } from './decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    
    const request = context.switchToHttp().getRequest();
    console.log('RolesGuard -> path:', request.path);
    console.log('RolesGuard -> requiredRoles:', requiredRoles);
    
    if (!requiredRoles) {
      return true;
    }
    const { user } = request;
    
    if (!user || !user.role) {
      return false;
    }
    
    // Fallback: If user is an ADMIN, they have access to all protected admin routes
    if (user.role.toUpperCase() === 'ADMIN') {
      return true;
    }
    
    const hasRole = requiredRoles.some(
      (role) => role.toUpperCase() === user.role.toUpperCase(),
    );
    return hasRole;
  }
}
