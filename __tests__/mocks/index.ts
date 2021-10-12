import faker from 'faker';
import _ from 'lodash';
import { sanitiseGmailAddress } from '../../src/server/utils';

/**
 * Generates random digits of a specified length
 * @param length Length of the random digits
 */
export function randomDigits(length: number) {
  const digits = Array.from({ length }).reduce((prev) => {
    const randomDigit = Math.floor(Math.random() * 9);
    return prev + String(randomDigit);
  }, '');

  return digits as string;
}

export function pickRandom(options: string[]): string {
  return options[Math.floor(Math.random() * options.length)];
}

export function mockIdentityRequest(role: 'user' | 'admin') {
  let email = faker.internet.email();
  if (email.endsWith('gmail.com')) email = sanitiseGmailAddress(email);

  return {
    dob: faker.date.past(1993),
    email,
    last_name: faker.name.lastName(),
    first_name: faker.name.firstName(),
    password: randomDigits(7),
    role
  };
}
