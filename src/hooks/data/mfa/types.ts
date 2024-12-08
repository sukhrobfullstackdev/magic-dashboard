import { QueryKey } from '@tanstack/react-query';

export type DisableMfaParams = {
  appId: string;
  authUserId: string;
  queryKey: QueryKey;
};
