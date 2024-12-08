'use client';

import { useCurrentTeam } from '@hooks/common/use-current-team';
import { IcoDiamond, Text } from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { HStack } from '@styled/jsx';
import { token } from '@styled/tokens';
import { useRouter } from 'next/navigation';
import { useCallback, type PropsWithChildren } from 'react';

type Props = PropsWithChildren & {
  onClick?: () => void;
};

export const UpsellBanner = ({ children, onClick }: Props) => {
  return (
    <HStack
      role="button"
      gap={2}
      bg="brand.lightest"
      rounded={10}
      px={4}
      py={3}
      w="full"
      maxW="45.5rem"
      boxSizing="border-box"
      cursor={onClick ? 'pointer' : 'auto'}
      onClick={onClick}
    >
      <IcoDiamond color={token('colors.brand.base')} />
      <Text>{children}</Text>
    </HStack>
  );
};

export const StartupPlanUpsellBanner = () => {
  const { push } = useRouter();
  const { currentTeam } = useCurrentTeam();

  const handleUpgradeTo = useCallback(() => {
    push('/checkout/upgrade-to-startup');
  }, [push]);

  return currentTeam.isOwner ? (
    <UpsellBanner onClick={handleUpgradeTo}>
      <span className={css({ color: 'brand.base', fontWeight: 'semibold' })}>Upgrade</span> to Startup Plan to unlock
    </UpsellBanner>
  ) : (
    <UpsellBanner>Ask {currentTeam.teamOwnerEmail} to upgrade to Startup Plan</UpsellBanner>
  );
};

export const GrowthPlanUpsellBanner = () => {
  const { push } = useRouter();
  const { currentTeam } = useCurrentTeam();

  const handleUpgradeTo = useCallback(() => {
    push('/checkout/upgrade-to-growth');
  }, [push]);

  return currentTeam.isOwner ? (
    <UpsellBanner onClick={handleUpgradeTo}>
      <span className={css({ color: 'brand.base', fontWeight: 'semibold' })}>Upgrade</span> to Growth Plan to unlock
    </UpsellBanner>
  ) : (
    <UpsellBanner>Ask {currentTeam.teamOwnerEmail} to upgrade to Growth Plan</UpsellBanner>
  );
};
