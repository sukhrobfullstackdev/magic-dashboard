import { HIGHTOUCH_API_HOST, HIGHTOUCH_API_KEY } from '@config';
import { HtEventsBrowser } from '@ht-sdks/events-sdk-js-browser';

export const hightouch = HtEventsBrowser.load(
  {
    writeKey: HIGHTOUCH_API_KEY,
  },
  { apiHost: HIGHTOUCH_API_HOST },
);
