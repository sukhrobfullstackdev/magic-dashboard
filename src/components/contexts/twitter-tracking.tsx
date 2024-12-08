import Script from 'next/script';

export const TwitterTracking = () => {
  return <Script src="/scripts/twitter-oct.js" strategy="lazyOnload"></Script>;
};
