import { IdentityExistsError } from '@app/server/controllers/base';
import { SignupDTO } from '@app/server/controllers/identity/identity.dto';
import { sanitiseGmailAddress } from '@app/server/utils';
import { BaseRepository, Repository } from '../base';
import { Identity } from './identity.model';
import IdentitySchema from './identity.schema';

export interface IIdentityRepository extends Repository<Identity> {
  createAccount(identity: SignupDTO): Promise<Identity>;
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
   * Creates an account for an identity
   * @param body Body for creating a identity
   */
  async createAccount(body: SignupDTO) {
    const identity = await this.create(body);

    return identity;
  }
}
