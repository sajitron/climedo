import jwt from 'jsonwebtoken';
import { IdentityExistsError } from '@app/server/controllers/base';
import { SignupDTO } from '@app/server/controllers/identity/identity.dto';
import { sanitiseGmailAddress } from '@app/server/utils';
import { BaseRepository, Repository } from '../base';
import { Identity } from './identity.model';
import IdentitySchema from './identity.schema';
import env from '@app/common/config/env';

export interface IIdentityRepository extends Repository<Identity> {
  /**
   * Creates an account for an identity
   * @param body Body for creating a identity
   */
  createAccount(identity: SignupDTO): Promise<Identity>;
  /**
   * sanitises gmail addresses and checks if already in use
   * @param email the identity's email address
   * @returns sanitised and unused email address or an error if email is used
   */
  sanitiseAndValidateEmail(email: string): Promise<string>;
  /**
   * Generates a token for an authenticated identity
   * @param identity
   * @returns a token
   */
  generateToken(identity: Identity): string;
}

export class IdentityRepository extends BaseRepository<Identity> {
  constructor() {
    super('Identity', IdentitySchema);
  }

  /**
   * Returns a boolean indicating whether an identitu exists
   * @param conditions Conditions for validating the existence of the identity.
   */
  async exists(conditions: object): Promise<boolean> {
    const identity = await this.model.findOne(conditions);
    return !!identity;
  }

  /**
   * sanitises gmail addresses and checks if already in use
   * @param email the identity's email address
   * @returns sanitised and unused email address or an error if email is used
   */
  async sanitiseAndValidateEmail(email: string): Promise<string> {
    if (email.endsWith('gmail.com')) email = sanitiseGmailAddress(email);

    const emailInUse = await this.exists({ email });

    if (emailInUse) throw new IdentityExistsError();

    return email;
  }

  /**
   * Generates a token for an authenticated identity
   * @param identity
   * @returns a token
   */
  generateToken(identity: Identity): string {
    const tokenData = {
      user: {
        first_name: identity.first_name,
        last_name: identity.last_name,
        role: identity.role,
        _id: identity._id
      }
    };
    const token = jwt.sign(tokenData, env.jwt_secret, {
      expiresIn: env.jwt_expiry,
      issuer: 'climedo'
    });
    return token;
  }

  /**
   * Creates an account for an identity
   * @param body Body for creating a identity
   */
  async createAccount(body: SignupDTO) {
    const identity = await this.create(body);

    return identity;
  }
}
