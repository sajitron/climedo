import redis from '@app/common/services/redis';
import {
  InvalidPasswordError,
  LockedOutError
} from '@app/server/controllers/base';

const DURATION_ONE_DAY = 60 * 60 * 24;

export const DAILY_FAILED_LOGIN_TRIES = 5;

const LOGIN_TRIES_KEY = 'login:tries';

export const LOCKED_OUT_KEY = 'locked_out:limit';
class LoginRateLimiterService {
  /**
   * Gets the `login tries` within a day for an identity from redis
   * @param account_number User phone number
   */
  async getLoginTries(account_number: string) {
    const key = `${LOGIN_TRIES_KEY}:${account_number}`;
    const loginTries = await redis.get(key);

    return Number(loginTries);
  }

  /**
   * Sets the `login tries` for an identity and persists it for a day
   * @param email identity email
   * @param tries Current number of tries for the identity. Defaults to `1`
   */
  private async setLoginTries(email: string, tries = 1) {
    const key = `${LOGIN_TRIES_KEY}:${email}`;
    await redis.set(key, tries, 'EX', DURATION_ONE_DAY);
  }

  /**
   * Returns the `locked out` status for an identity from redis
   * @param email Identity email
   */
  async getLockedOutStatus(email: string) {
    const key = `${LOCKED_OUT_KEY}:${email}`;
    return await redis.get(key);
  }

  /**
   * Sets the `locked out` status of an identity to true and persists it for a day
   * @param email Identity email
   */
  private async setLockedOutStatus(email: string) {
    const key = `${LOCKED_OUT_KEY}:${email}`;
    await redis.set(key, true, 'EX', DURATION_ONE_DAY);
  }

  /**
   * Increments an identity's `login tries` limit and locks the identity out if they exceed the allowed daily limit
   * @param email Identity email
   */
  async limit(email: string) {
    const loginTries = await this.getLoginTries(email);
    const updatedLoginTries = loginTries + 1;
    const remainingTries = DAILY_FAILED_LOGIN_TRIES - updatedLoginTries;

    if (updatedLoginTries === DAILY_FAILED_LOGIN_TRIES) {
      await this.setLockedOutStatus(email);
      throw new LockedOutError();
    }

    await this.setLoginTries(email, updatedLoginTries);

    throw new InvalidPasswordError(remainingTries);
  }

  /**
   * Checks if an identity is locked out and throws an error if they are
   * @param email Identity email
   */
  async isUserLockedOut(email: string) {
    const isLockedOut = await this.getLockedOutStatus(email);
    if (isLockedOut) throw new LockedOutError();
  }

  /**
   * Resets the locked out status and login limits for an identity
   * @param email Identity email
   */
  async reset(email: string) {
    if (this.getLoginTries(email))
      await redis.del(`${LOGIN_TRIES_KEY}:${email}`);

    if (this.getLockedOutStatus(email))
      await redis.del(`${LOCKED_OUT_KEY}:${email}`);
  }
}

export default new LoginRateLimiterService();
