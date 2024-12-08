import { PLAN_NAMES } from '@constants/pricing';
import { useKeyDown } from '@hooks/common/use-keydown';
import { type PlanName } from '@interfaces/pricing';
import { IcoDiamond, Text, useToast } from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { HStack } from '@styled/jsx';
import { token } from '@styled/tokens';
import { useCopyToClipboard } from '@uidotdev/usehooks';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

type Props = {
  planName?: PlanName;
  isOwner?: boolean;
  teamOwnerEmail?: string;
};

export const UpgradePlanBanner = ({ planName = PLAN_NAMES.STARTUP, isOwner = false, teamOwnerEmail }: Props) => {
  const router = useRouter();
  const [, copy] = useCopyToClipboard();
  const { createToast } = useToast();

  const handleUpgrade = useCallback(() => {
    if (planName === PLAN_NAMES.STARTUP || planName === PLAN_NAMES.GROWTH) {
      router.push(`/checkout/upgrade-to-${planName.toLowerCase()}`);
    } else {
      router.push('/account/billing');
    }
  }, [planName, router]);

  const handleCopy = useCallback(() => {
    if (!teamOwnerEmail) {
      createToast({
        message: 'Failed to copy to clipboard',
        variant: 'error',
      });
      return;
    }

    copy(teamOwnerEmail)
      .then(() => {
        createToast({
          message: 'Copied to clipboard',
          variant: 'success',
        });
      })
      .catch(() => {
        createToast({
          message: 'Failed to copy to clipboard',
          variant: 'error',
        });
      });
  }, [copy, teamOwnerEmail, createToast]);

  return (
    <HStack
      role="button"
      gap={2}
      rounded={10}
      bg="brand.lightest"
      px={4}
      h={12}
      cursor="pointer"
      w="full"
      maxW={760}
      onClick={isOwner ? handleUpgrade : handleCopy}
      onKeyDown={useKeyDown(isOwner ? handleUpgrade : handleCopy, ['Enter'])}
      tabIndex={0}
    >
      <IcoDiamond color={token('colors.brand.base')} />
      {isOwner ? (
        <Text>
          <span className={css({ color: 'brand.base', fontWeight: 600 })}>Upgrade</span> to {planName} Plan to unlock
        </Text>
      ) : (
        <Text>
          Ask {teamOwnerEmail} to subscribe to {planName} Plan
        </Text>
      )}
    </HStack>
  );
};
