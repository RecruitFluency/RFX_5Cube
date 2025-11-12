import { SetMetadata } from '@nestjs/common';
import { ROLES_KEY } from '../const/metadata-key.const';
import { EUserRole } from '../enum/user-role.enum';

export const Roles = (...roles: EUserRole[]) => SetMetadata(ROLES_KEY, roles);
