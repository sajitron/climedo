import crypto from 'crypto';
import { promisify } from 'util';

/**
 * Unwraps a service API response and returns the actual data
 * @param promise The request promise
 */
export const getResponseData = async <T = any>(promise: Promise<any>) => {
  const res = await promise;
  return res.data.data as T;
};

/**
 * Generates random bytes
 */
export const genRandomBytes = promisify(crypto.randomBytes);

/**
 * Generates random digits of a specified length
 * @param length The amount of random digits to generate and return
 */
export const randomDigits = (length: number) => {
  const digits = Array.from({ length }).reduce((prev, curr) => {
    return prev + String(Math.floor(Math.random() * 9));
  }, '') as string;

  return digits;
};

/**
 * Removes special characters from gmail addresses
 * Gmail classifies usernames with special characters like `.` & those without it as the same.
 * Therefore, darthvader@gmail.com is the same as darth.vader@gmail.com as well as dar.th.va.der@gmail.com
 * @param email the identity's email address
 * @returns a sanitised emailaddress
 */
export function sanitiseGmailAddress(email: string): string {
  const [username, domain] = email.split('@');
  const sanitisedUsername = username.replace(
    /[`~!#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi,
    ''
  );

  return `${sanitisedUsername}@${domain}`;
}
