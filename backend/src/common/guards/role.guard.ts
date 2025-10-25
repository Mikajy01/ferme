// src/common/guards/roles.guard.ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/role.decorator';
import { InvalidRoleException } from '../exceptions/invalid-role.exception';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    // Si aucun rôle n'est requis, on autorise l'accès
    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    // Si l'utilisateur n'a pas de rôle
    if (!user || !user.role) {
      throw new InvalidRoleException();
    }
    
    // Vérifier si l'utilisateur a le rôle requis
    const hasRole = requiredRoles.includes(user.role);
    
    if (!hasRole) {
      throw new InvalidRoleException();
    }
    
    return true;
  }
}