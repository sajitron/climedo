import dotenv from 'dotenv';

dotenv.config();

/**
 * Environment variables required for all environments (dev, testing, staging, production)
 */
const requiredVariables = ['port', 'redis_url', 'jwt_secret'];

/**
 * Environment variables required for both staging and production
 */
const productionAndStagingVariables = [
  'mongodb_url',
  'mongodb_username',
  'mongodb_password',
  'mongodb_url',
  'redis_password'
];

/**
 * Requires MongoDB and Redis credentials in production and staging, else uses Redis and MongoDB connection string directly
 * in dev or any other environment
 */
if (['production', 'staging'].includes(process.env.NODE_ENV))
  requiredVariables.push(...productionAndStagingVariables);
else requiredVariables.push('mongodb_url');

const env = {
  port: Number(process.env.PORT),
  redis_url: process.env.REDIS_URL,
  redis_password: process.env.REDIS_PASSWORD,
  mongodb_url: process.env.MONGODB_URL,
  mongodb_password: process.env.MONGODB_PASSWORD,
  mongodb_username: process.env.MONGODB_USERNAME,
  app_env: process.env.NODE_ENV || 'development',
  api_version: process.env.API_VERSION || '/api/v1',
  service_name: process.env.SERVICE_NAME || 'climedo',
  salt_rounds: Number(process.env.SALT_ROUNDS) || 10,
  jwt_expiry: Number(process.env.JWT_EXPIRY) || 3600,
  jwt_secret: process.env.JWT_SECRET
};

const missingVariables = requiredVariables.reduce(
  (acc, varName) => (!env[varName] ? acc.concat(varName.toUpperCase()) : acc),
  []
);

if (!!missingVariables.length)
  throw new Error(
    `The following required variables are missing: ${missingVariables}}`
  );

export default env;
