import { Request } from 'express';
import { UserEntity } from '../../../feature/user/entities/user.entity';

export interface IRequestWithUser extends Request {
    user: UserEntity;
}
