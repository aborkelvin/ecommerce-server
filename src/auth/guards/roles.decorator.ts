
import { SetMetadata } from '@nestjs/common';
import { eUserRole } from 'src/user/enums/userRole.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: eUserRole[]) => SetMetadata(ROLES_KEY, roles);
