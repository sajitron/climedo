import { Role } from '@app/data/identity';

/**
 * Payload sent for a login request
 */
export interface LoginDTO {
  email: string;
  password: string;
}

/**
 * Payload sent for a signup request
 */
export interface SignupDTO {
  first_name: string;
  last_name: string;
  email: string;
  dob: Date;
  role: Role;
  password: string;
}

/**
 * Payload sent for changing (updating) an identity's password
 */
export interface UpdatePasswordDTO {
  password: string;
}

/**
 * Payload sent for updating an identity's profile
 */
export interface UpdateIdentityDTO {
  first_name?: string;
  last_name?: string;
  email?: string;
  dob?: Date;
}

/**
 * Payload sent for a logout request
 */
export interface LogoutDTO {
  identity_id: string;
}
