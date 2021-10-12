import { Model } from '../base';

export interface Identity extends Model {
  // personal details
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  dob: Date;
  /**
   * identity's last login date
   */
  last_login: Date;
  /**
   * identity's role on the platform
   */
  role: Role;

  updatePassword: (plainText: string) => Promise<Identity>;
}

export type Role = 'user' | 'admin';
