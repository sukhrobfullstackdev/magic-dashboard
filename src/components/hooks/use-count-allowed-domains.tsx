import { getAllowlistCount } from '@libs/get-allowlist-count';
import { getAllowlisted } from '@services/access-allowlisting';
import { useSuspenseQuery } from '@tanstack/react-query';

type Props = {
  appId: string;
};

export const useCountAllowedDomains = ({ appId }: Props) => {
  const { data } = useSuspenseQuery<number>({
    queryKey: ['count-allowed-domains', appId],
    queryFn: async () => {
      const response = await getAllowlisted(appId);
      return response.data ? getAllowlistCount(response.data) : 0;
    },
  });

  return {
    count: data,
  };
};
