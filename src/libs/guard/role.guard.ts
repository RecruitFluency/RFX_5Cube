import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../const/metadata-key.const';
import { EUserRole } from '../enum/user-role.enum';
import { IRequestWithUser } from '../interface/request/request-with-user.interface';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<EUserRole[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles) {
            return true;
        }

        const { user }: IRequestWithUser = context.switchToHttp().getRequest();

        return requiredRoles.some((role) => user.role === role);
    }
}
