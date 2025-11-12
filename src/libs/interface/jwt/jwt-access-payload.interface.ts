import { IJwtBasePayload } from './jwt-base-payload.interface';
import { EUserRole } from '../../enum/user-role.enum';

export interface IJWTAccessPayload extends IJwtBasePayload {
    role: EUserRole;
}
