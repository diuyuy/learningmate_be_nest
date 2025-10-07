import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { Roles } from '../decorators/roles';
import { RequestWithUser } from '../types/request-with-user';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const roles = this.reflector.get(Roles, context.getClass());

    if (roles.length === 0) return true;

    const request = context.switchToHttp().getRequest<RequestWithUser>();

    return this.matchRoles(roles[0], request.user.role);
  }

  matchRoles(targetRoles: string, usersRoles: string) {
    return targetRoles === usersRoles;
  }
}
