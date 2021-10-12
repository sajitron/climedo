/**
 * Payload sent for updating an identity's profile
 */
export interface UpdateIdentityDTO {
  first_name?: string;
  last_name?: string;
  email?: string;
  dob?: Date;
}
