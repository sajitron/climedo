import joi from 'joi';

export const updateIdentity = joi.object({
  first_name: joi.string().trim(),
  last_name: joi.string().trim(),
  email: joi.string().email().trim(),
  dob: joi.date()
});
