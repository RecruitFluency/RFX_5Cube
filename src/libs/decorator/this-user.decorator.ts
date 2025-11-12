import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IRequestWithUser } from '../interface/request/request-with-user.interface';
import { UserEntity } from '../../feature/user/entities/user.entity';

export const ThisUser = createParamDecorator((_data: string, ctx: ExecutionContext): UserEntity => {
    const request: IRequestWithUser = ctx.switchToHttp().getRequest();

    return request.user;
});
