'use client';

import {
  AppAuthMethodEnabledModal,
  useAppAuthMethodEnabledModal,
} from '@components/partials/app-auth-method-enabled-modal/app-auth-method-enabled-modal';
import { AuthMethodCard } from '@components/presentation/auth-method-card/auth-method-card';
import { SwitchCase } from '@components/presentation/switch-case';
import { UpgradePlanBanner } from '@components/views/mfa-view/upgrade-plan-banner';
import { APP_AUTH_METHOD_NAMES } from '@constants/appInfo';
import { PLAN_NAMES } from '@constants/pricing';
import { useCurrentApp } from '@hooks/common/use-current-app';
import { usePlan } from '@hooks/common/use-plan';
import { useAuthMethodsSuspenseQuery, useUpdateAppAuthMethodMutation } from '@hooks/data/app';
import { appQueryKeys } from '@hooks/data/app/keys';
import { type App } from '@hooks/data/user/types';
import {
  Button,
  IcoExternalLink,
  IcoKebab,
  IcoLockLocked,
  IcoMobile2fafill,
  Popover,
  Text,
} from '@magiclabs/ui-components';
import { Box, Divider, Stack } from '@styled/jsx';
import { token } from '@styled/tokens';
import Link from 'next/link';
import { useCallback, useMemo } from 'react';

const MFA_STATUS = {
  LOCKED: 'LOCKED',
  DISABLED: 'DISABLED',
  ENABLED: 'ENABLED',
} as const;

const Resolved = ({ app }: { app: App }) => {
  const open = useAppAuthMethodEnabledModal((state) => state.open);

  const {
    plan: { featureFlags },
  } = usePlan({
    teamId: app.teamId,
  });

  const { data: authMethods } = useAuthMethodsSuspenseQuery(
    appQueryKeys.authMethods({
      appId: app.appId,
      appType: app.appType,
    }),
  );

  const { mutateAsync: updateAppAuthMethod, isPending } = useUpdateAppAuthMethodMutation();

  const isOwner = useMemo(() => {
    return app.isOwner;
  }, [app.isOwner]);

  const status = useMemo(() => {
    if (!featureFlags.includes('mfa')) {
      return MFA_STATUS.LOCKED;
    }

    const authMethod = authMethods.find((v) => v.name === APP_AUTH_METHOD_NAMES.MFA);

    if (!authMethod?.is_active) {
      return MFA_STATUS.DISABLED;
    }
    return MFA_STATUS.ENABLED;
  }, [authMethods, featureFlags]);

  const handleClickEnable = useCallback(async () => {
    await updateAppAuthMethod({
      appId: app.appId,
      appType: app.appType,
      name: APP_AUTH_METHOD_NAMES.MFA,
      isActive: true,
    });

    open(APP_AUTH_METHOD_NAMES.MFA);
  }, [updateAppAuthMethod, app.appId, open]);

  return (
    <>
      <Stack gap={7}>
        {status === MFA_STATUS.LOCKED && (
          <UpgradePlanBanner planName={PLAN_NAMES.STARTUP} isOwner={isOwner} teamOwnerEmail={app.teamOwnerEmail} />
        )}
        <AuthMethodCard enabled={status === MFA_STATUS.ENABLED}>
          <AuthMethodCard.Icon>
            <IcoMobile2fafill
              color={token(`colors.${status === MFA_STATUS.ENABLED ? 'brand.base' : 'neutral.primary'}`)}
              width={30}
              height={30}
            />
          </AuthMethodCard.Icon>
          <AuthMethodCard.Label>Mobile App MFA</AuthMethodCard.Label>
          <AuthMethodCard.Action>
            <SwitchCase
              value={status}
              caseBy={{
                [MFA_STATUS.LOCKED]: <IcoLockLocked color={token('colors.text.tertiary')} />,
                [MFA_STATUS.DISABLED]: (
                  <Button
                    size="sm"
                    label="Enable"
                    onPress={handleClickEnable}
                    disabled={isPending}
                    validating={isPending}
                  />
                ),
                [MFA_STATUS.ENABLED]: (
                  <Popover variant="text" trigger="click">
                    <Popover.LeadingIcon>
                      <IcoKebab />
                    </Popover.LeadingIcon>
                    <Popover.Content>
                      <Stack gap={1.5}>
                        <Link
                          href="https://magic.link/docs/authentication/features/mfa"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="text" size="sm" label="Docs">
                            <Button.TrailingIcon>
                              <IcoExternalLink />
                            </Button.TrailingIcon>
                          </Button>
                        </Link>

                        <Divider color="neutral.tertiary" />

                        <Box>
                          <Button variant="text" textStyle="negative" size="sm" label="Disable" disabled />
                        </Box>
                      </Stack>
                    </Popover.Content>
                  </Popover>
                ),
              }}
            />
          </AuthMethodCard.Action>
        </AuthMethodCard>
      </Stack>
      <AppAuthMethodEnabledModal />
    </>
  );
};

export const MfaView = () => {
  const { currentApp } = useCurrentApp();

  return (
    <Stack p={8} gap={7}>
      <Stack gap={2}>
        <Text.H3>Multi-Factor Authentication</Text.H3>
        <Text fontColor="text.secondary">Offer email or SMS users added security through app-based MFA.</Text>
      </Stack>

      {currentApp && <Resolved app={currentApp} />}
    </Stack>
  );
};
