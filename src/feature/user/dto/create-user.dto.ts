import { EUserRole } from '../../../libs/enum/user-role.enum';
import { EUserStatus } from '../../../libs/enum/user-status.enum';

export class CreateUserDto {
    fullName: string;
    email: string;
    password: string;
    role?: EUserRole;
    status?: EUserStatus;
    clubId?: number;
}
