import { useLocalStorage } from '@components/hooks/use-localstorage';
import { useEffect, type PropsWithChildren } from 'react';

export const LocalStoragePnPKeys = ({ children }: PropsWithChildren) => {
  /**
   * Check for api key and magicCredential for PNP auth
   * If both are present, we remove them from the localStorage
   * @see https://github.com/fortmatic/magic-dashboard/commit/68655447d53dfcd20d41b2cd7aa631db35d0b272
   */
  const [clientID, setClientID] = useLocalStorage('pnp/magic_client_id', null);
  const [apiKey, setApiKey] = useLocalStorage('pnp/live_api_key', null);

  useEffect(() => {
    if (clientID || apiKey) {
      setClientID(null);
      setApiKey(null);
    }
  }, [clientID, apiKey, setApiKey, setClientID]);

  return <>{children}</>;
};
