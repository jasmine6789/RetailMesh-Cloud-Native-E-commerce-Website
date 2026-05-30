import type { AuthUser } from '../types';
import type { AuthUserDto } from '../services/authApi';

export function authUserDtoToAuthUser(dto: AuthUserDto): AuthUser {
  return {
    id: dto.id,
    username: dto.userName || dto.email,
    displayName: dto.displayName || dto.email,
    email: dto.email,
    firstName: dto.firstName,
    lastName: dto.lastName,
    claims: {
      roles: dto.roles,
    },
  };
}
