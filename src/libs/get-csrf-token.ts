import { ENV, ENVType } from '@config';

const CSRF_COOKIE_NAME = {
  [ENVType.Local]: '_local_csrf_token=',
  [ENVType.Dev]: '_dev_csrf_token=',
  [ENVType.Stagef]: '_stagef_csrf_token=', // stagef endpoint is not checking CSRF
  [ENVType.Prod]: '_csrf_token=',
};

/**
 * Request forgery prevention: Parse the _csrf_token
 * from cookies with every authentic api request made with
 * Magic Dashboard application.
 * */
export function getCSRFToken() {
  const cookies = document.cookie.split(';');

  for (const cookie of cookies) {
    const trimmedCookie = cookie.trim();
    if (trimmedCookie.startsWith(CSRF_COOKIE_NAME[ENV])) return trimmedCookie.substring(CSRF_COOKIE_NAME[ENV].length);
  }
  return '';
}
