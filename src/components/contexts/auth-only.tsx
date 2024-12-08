import { FallbackLoading } from '@components/partials/fallback-loading/fallback-loading';
import { useUserInfoQuery } from '@hooks/data/user';
import { userQueryKeys } from '@hooks/data/user/keys';
import { useRouter } from 'next/navigation';
import { useEffect, type PropsWithChildren } from 'react';

export const AuthOnly = ({ children }: PropsWithChildren) => {
  const router = useRouter();
  const { isPending, isError } = useUserInfoQuery(userQueryKeys.info());

  useEffect(() => {
    if (isError) {
      router.replace('/login');
    }
  }, [isError]);

  if (isError) {
    return <></>;
  }

  if (isPending) {
    return <FallbackLoading />;
  }

  return <>{children}</>;
};
