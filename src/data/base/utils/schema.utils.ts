import { v4 as generateUUID } from 'uuid';
import { SchemaTypes } from 'mongoose';

/**
 * Removes _id field in subdocuments and allows virtual fields to be returned
 */
export const readMapper = {
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform: (doc, ret, options) => {
      if (ret.password) delete ret.password;
      if (ret.token) delete ret.token;
      return ret;
    }
  }
};

/**
 * Defines timestamps fields in a schema
 */
export const timestamps = {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
};

/**
 * Replaces the default mongoose id with a uuid string
 */
export const uuid = {
  type: SchemaTypes.String,
  default: generateUUID
};

/**
 * Defines a schema type with a trimmed string
 */
export const trimmedString = {
  type: SchemaTypes.String,
  trim: true
};

/**
 * Defines a schema type with a trimmed required string
 */
export const trimmedRequiredString = {
  type: SchemaTypes.String,
  required: true,
  trim: true
};

/**
 * Defines a schema type with a lowercased trimmed string
 */
export const trimmedLowercaseString = {
  type: SchemaTypes.String,
  lowercase: true,
  trim: true
};

export const uniqueIndex = {
  unique: true,
  index: true,
  required: true
};
