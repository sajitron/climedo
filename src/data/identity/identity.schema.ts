import { SchemaTypes } from 'mongoose';
import bcrypt from 'bcrypt';
import { trimmedString, SchemaFactory } from '../base';
import { Identity } from './identity.model';
import env from '@app/common/config/env';

const IdentitySchema = SchemaFactory({
  password: { ...trimmedString, required: true, select: false },
  email: { ...trimmedString, unique: true, sparse: true },
  first_name: { ...trimmedString, index: true, required: true },
  last_name: { ...trimmedString, index: true },
  dob: { type: SchemaTypes.Date },
  last_login: { type: SchemaTypes.Date },
  role: { ...trimmedString, enum: ['user', 'admin'] },
  token: { ...trimmedString, default: null, select: false }
});

/**
 * Mongoose Pre-save hook used to hash passwords for new identities
 */
IdentitySchema.pre('save', async function () {
  const identity = <Identity>this;
  if (!identity.isNew) return;

  const hash = await bcrypt.hash(identity.password, env.salt_rounds);
  identity.password = hash;
});

/**
 * Document method used to check if a plain text password is the same as a hashed password
 * @param plainText Plain text to be hashed and set as the paswword
 */
IdentitySchema.method('isPasswordValid', async function (plainText: string) {
  const identity = <Identity>this;
  const result = await bcrypt.compare(plainText, identity.password);
  return result;
});

/**
 * Document method used to change an identity's password.
 * @param plainText Plain text to be hashed and set as the paswword
 */
IdentitySchema.method('updatePassword', async function (plainText: string) {
  const identity = <Identity>this;
  const hash = await bcrypt.hash(plainText, env.salt_rounds);
  identity.password = hash;
  return await identity.save();
});

export default IdentitySchema;
