import faker from 'faker';

/**
 * Generates random digits of a specified length
 * @param length The amount of random digits to generate and return
 */
const randomDigits = (length: number): string => {
  return Math.random()
    .toString()
    .slice(2, 2 + length);
};

/**
 * Create Mock Identity Payload.
 */
export function createMockIdentityPayload() {
  return {
    dob: faker.date.past(1993),
    email: faker.internet.email(),
    first_name: faker.name.firstName(),
    last_name: faker.name.lastName(),
    password: randomDigits(4),
    role: 'user'
  };
}
