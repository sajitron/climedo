import joi from 'joi';

export const signup = joi.object({
  first_name: joi.string().trim().required(),
  last_name: joi.string().trim().required(),
  email: joi.string().email().trim().required(),
  password: joi.string().trim().min(6).required(),
  dob: joi.date().required(),
  role: joi.string().trim().valid('user', 'admin').required()
});

export const login = joi.object({
  email: joi.string().email().required(),
  password: joi
    .string()
    .trim()
    .regex(/[0-9]{4}/)
    .length(4)
    .required()
});
