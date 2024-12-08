import { SwitchCase } from '@components/presentation/switch-case';
import { useCurrentTeam } from '@hooks/common/use-current-team';
import { useTeamInfoSuspenseQuery } from '@hooks/data/teams';
import { teamQueryKeys } from '@hooks/data/teams/keys';
import { Button, IcoArrowRight, IcoDismiss, IcoMegaphone, Text } from '@magiclabs/ui-components';
import { HStack } from '@styled/jsx';
import { token } from '@styled/tokens';
import { useLocalStorage } from '@uidotdev/usehooks';
import { useCallback, useMemo } from 'react';

const NOTICE_BANNER_TYPES = {
  NEW_SECURITY: 'new-security',
  NONE: 'none',
} as const;

export const NoticeBanner = () => {
  const [isSecurityBannerDismissed, setIsSecurityBannerDismissed] = useLocalStorage('isBannerDismissed', false);
  const { currentTeamId } = useCurrentTeam();
  const { data: teamInfo } = useTeamInfoSuspenseQuery(teamQueryKeys.info({ teamId: currentTeamId }));

  const status = useMemo(() => {
    if (!teamInfo.isConnectAppEnabled && isSecurityBannerDismissed) {
      return NOTICE_BANNER_TYPES.NEW_SECURITY;
    }

    return NOTICE_BANNER_TYPES.NONE;
  }, [isSecurityBannerDismissed, teamInfo.isConnectAppEnabled]);

  const handleDismiss = useCallback(() => {
    if (status === NOTICE_BANNER_TYPES.NEW_SECURITY) {
      setIsSecurityBannerDismissed(true);
    }
  }, [setIsSecurityBannerDismissed, status]);

  if (status === NOTICE_BANNER_TYPES.NONE) {
    return null;
  }

  return (
    <HStack gap={3} p={4} justifyContent="space-between" bg="brand.lightest">
      <HStack gap={3}>
        <IcoMegaphone width={24} height={24} color={token('colors.brand.darkest')} />
        <SwitchCase
          value={status}
          caseBy={{
            [NOTICE_BANNER_TYPES.NEW_SECURITY]: (
              <>
                <Text styles={{ color: token('colors.brand.darkest') }}>
                  You can now enable new security settings for your users!
                </Text>
                <a href="https://magic.link/posts/protect-users-security" target="_blank" rel="noopener noreferrer">
                  <Button variant="text" label="Learn more">
                    <Button.TrailingIcon>
                      <IcoArrowRight />
                    </Button.TrailingIcon>
                  </Button>
                </a>
              </>
            ),
          }}
        />
      </HStack>
      <Button variant="text" size="sm" aria-label="dismiss" onPress={handleDismiss}>
        <Button.LeadingIcon color={token('colors.brand.darkest')}>
          <IcoDismiss />
        </Button.LeadingIcon>
      </Button>
    </HStack>
  );
};
