export class ApiError extends Error {
  constructor(status, message) {
    super(message);

    this.name = this.constructor.name;
    this.status = status;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
