import { Button } from '@magiclabs/ui-components';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export const ChangePlan = () => {
  const router = useRouter();

  const handleGoToPricing = useCallback(() => {
    router.push('/pricing');
  }, [router]);

  return <Button size="sm" variant="text" label="Change Plan" onPress={handleGoToPricing} />;
};
