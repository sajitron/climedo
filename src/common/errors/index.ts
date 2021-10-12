import HttpStatus from 'http-status-codes';

export class ControllerError extends Error {
  code: number;
  error_code: number;
  constructor(message: string, code?: number, error_code?: number) {
    super(message);
    this.code = code || 400;
    this.error_code = error_code || 0;
  }
}

export class ActionNotAllowedError extends ControllerError {
  constructor(message: string) {
    super(message);
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

export class AccountExistsError extends ControllerError {
  constructor(id: string) {
    const errorMessage = `account with id: (${id}) exists`;
    super(errorMessage);

    this.code = HttpStatus.BAD_REQUEST;
    this.error_code = 701;
  }
}

export class MissingAuthHeaderError extends ControllerError {
  constructor() {
    const errorMessage = `authorization header not found`;
    super(errorMessage);

    this.code = HttpStatus.UNAUTHORIZED;
    this.error_code = 703;
  }
}

export class InvalidAuthSchemeError extends ControllerError {
  constructor() {
    const errorMessage = `invalid auth scheme`;
    super(errorMessage);

    this.code = HttpStatus.UNAUTHORIZED;
    this.error_code = 704;
  }
}

export class AccountNotFoundError extends ControllerError {
  constructor(id?: string) {
    const errorMessage = `account with id: (${id}) does not exist`;
    super(errorMessage);

    this.code = HttpStatus.BAD_REQUEST;
    this.error_code = 706;
  }
}
