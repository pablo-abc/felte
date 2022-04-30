import type { SuccessResponse, FetchResponse } from './error';
import { FelteSubmitError } from './error';

export function createDefaultSubmitHandler(form?: HTMLFormElement) {
  if (!form) return;
  return async function onSubmit(): Promise<SuccessResponse> {
    let body: FormData | URLSearchParams = new FormData(form);
    const action = new URL(form.action);
    const method =
      form.method.toLowerCase() === 'get'
        ? 'get'
        : action.searchParams.get('_method') || form.method;
    let enctype = form.enctype;

    if (form.querySelector('input[type="file"]')) {
      enctype = 'multipart/form-data';
    }
    if (method === 'get' || enctype === 'application/x-www-form-urlencoded') {
      body = new URLSearchParams(body as any);
    }

    let fetchOptions: RequestInit;

    if (method === 'get') {
      (body as URLSearchParams).forEach((value, key) => {
        action.searchParams.append(key, value);
      });
      fetchOptions = { method };
    } else {
      fetchOptions = {
        method,
        body,
        headers: {
          'Content-Type': enctype,
        },
      };
    }

    const response: FetchResponse = await window.fetch(
      action.toString(),
      fetchOptions
    );

    if (response.ok) return response;
    throw new FelteSubmitError(
      'An error occurred while submitting the form',
      response
    );
  };
}
