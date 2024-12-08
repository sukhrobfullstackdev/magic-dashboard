import { BACKEND_URL } from '@config';
import { getCSRFToken } from '@libs/get-csrf-token';
import { emitRequest } from '@services/http/http-utils';

export interface FortmaticAPIResponse<TData = object | []> {
  data: TData;
  error_code: string;
  message: string;
  status: string;
}

function getRequestHeaders() {
  return new Headers({
    'X-Magic-CSRF': getCSRFToken(),
  });
}

function getFortmaticRequestInit<T>(method: string, headers: Headers, body?: T): RequestInit {
  return {
    headers,
    method,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  };
}

export function call<TBody, TResponse extends FortmaticAPIResponse = FortmaticAPIResponse>(
  method: string,
  endpoint: string,
  headers: Headers,
  body?: TBody,
): Promise<TResponse> {
  const init = getFortmaticRequestInit(method, headers, body);
  return emitRequest({ url: new URL(endpoint, BACKEND_URL).href, init });
}

export function Get<TResponse extends FortmaticAPIResponse = FortmaticAPIResponse>(
  endpoint: string,
): Promise<TResponse> {
  const headers = getRequestHeaders();
  const init = getFortmaticRequestInit('GET', headers);
  return emitRequest({ url: new URL(endpoint, BACKEND_URL).href, init });
}

export function Post<TBody, TResponse extends FortmaticAPIResponse = FortmaticAPIResponse>(
  endpoint: string,
  body: TBody = {} as TBody,
  token?: string,
  setContentType = true,
): Promise<TResponse> {
  const headers = getRequestHeaders();
  if (setContentType) headers.append('Content-Type', 'application/json');
  if (token) headers.append('Authorization', `Bearer ${token}`);
  const init = getFortmaticRequestInit('POST', headers, body);
  return emitRequest<TResponse>({ url: new URL(endpoint, BACKEND_URL).href, init });
}

export function Delete<TBody, TResponse extends FortmaticAPIResponse = FortmaticAPIResponse>(
  endpoint: string,
  body: TBody = {} as TBody,
  token?: string,
  setContentType = true,
): Promise<TResponse> {
  const headers = getRequestHeaders();
  if (setContentType) headers.append('Content-Type', 'application/json');
  if (token) headers.append('Authorization', `Bearer ${token}`);
  const init = getFortmaticRequestInit('DELETE', headers, body);
  return emitRequest<TResponse>({ url: new URL(endpoint, BACKEND_URL).href, init });
}

export function Put<TBody, TResponse extends FortmaticAPIResponse = FortmaticAPIResponse>(
  endpoint: string,
  body: TBody = {} as TBody,
  token?: string,
  setContentType = true,
): Promise<TResponse> {
  const headers = getRequestHeaders();
  if (setContentType) headers.append('Content-Type', 'application/json');
  if (token) headers.append('Authorization', `Bearer ${token}`);
  const init = getFortmaticRequestInit('PUT', headers, body);
  return emitRequest<TResponse>({ url: new URL(endpoint, BACKEND_URL).href, init });
}

export function rawFetch(endpoint: string, extraOptions: RequestInit = {}) {
  const headers = getRequestHeaders();
  return fetch(new URL(endpoint, BACKEND_URL).href, {
    headers: {
      ...headers,
      ...(extraOptions.headers || {}),
    },
    credentials: 'include',
    ...extraOptions,
  });
}
