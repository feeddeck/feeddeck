export class FeedValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FeedValidationError';
  }
}

export class FeedGetAndParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FeedGetParseError';
  }
}
