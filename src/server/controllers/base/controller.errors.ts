import HttpStatus from 'http-status-codes';

export class ControllerError extends Error {
  code: number;
  error_code: number;
  constructor(message: string, code?: number, error_code?: number) {
    super(message);
    this.code = code || 400;
    error_code = error_code || 0;
  }
}

export class ActionNotAllowedError extends ControllerError {
  constructor(message: string) {
    super(message);
    this.code = HttpStatus.BAD_REQUEST;
  }
}

export class InvalidPasswordError extends ControllerError {
  constructor(remainingTries: number) {
    const errorMessage = `Invalid password entered. You have ${remainingTries} tr${
      remainingTries > 1 ? 'ies' : 'y'
    } left`;
    super(errorMessage);

    this.code = HttpStatus.BAD_REQUEST;
  }
}

/**
 * Sets the HTTP status code to 404 `Not Found` when a queried item is not found.
 */
export class NotFoundError extends ControllerError {
  constructor(message: string) {
    super(message, HttpStatus.NOT_FOUND);
  }
}

export class IdentityExistsError extends ControllerError {
  constructor() {
    const errorMessage = 'An identity with matching details exists';
    super(errorMessage);

    this.code = HttpStatus.BAD_REQUEST;
  }
}

export class LockedOutError extends ControllerError {
  constructor() {
    const errorMessage =
      "You can't proceed because your account has been blocked";
    super(errorMessage);

    this.code = HttpStatus.BAD_REQUEST;
  }
}
