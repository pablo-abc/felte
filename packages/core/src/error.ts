export type FailResponse = Omit<Response, 'ok'> & {
  ok: false;
};

export type SuccessResponse = Omit<Response, 'ok'> & {
  ok: true;
};

export type FetchResponse = SuccessResponse | FailResponse;

export class FelteSubmitError extends Error {
  constructor(message: string, response: FailResponse) {
    super(message);
    this.name = 'FelteSubmitError';
    this.response = response;
  }
  response: FailResponse;
}
