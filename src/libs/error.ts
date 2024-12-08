export class CustomError extends Error {
  __proto__ = Error;

  public code: string;

  constructor(err?: { error_code?: string; message?: string }) {
    super(err?.message ?? 'Internal error.');
    this.code = err?.error_code ?? 'UNKNOWN_ERROR';
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}
