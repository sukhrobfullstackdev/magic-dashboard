import { useAnalytics } from '@components/hooks/use-analytics';
import { useAppAuthMethodDisableModal } from '@components/partials/app-auth-method-disable-modal/app-auth-method-disable-modal';
import { useAppAuthMethodEnabledModal } from '@components/partials/app-auth-method-enabled-modal/app-auth-method-enabled-modal';
import { AuthMethodCard } from '@components/presentation/auth-method-card/auth-method-card';
import { SwitchCase } from '@components/presentation/switch-case';
import { APP_AUTH_METHODS_METADATA } from '@constants/app-auth-methods';
import { APP_AUTH_METHOD_NAMES, AppType } from '@constants/appInfo';
import { useAuthMethodsSuspenseQuery, useUpdateAppAuthMethodMutation } from '@hooks/data/app';
import { appQueryKeys } from '@hooks/data/app/keys';
import { logger } from '@libs/datadog';
import { Button, IcoExternalLink, IcoKebab, Popover, useToast } from '@magiclabs/ui-components';
import { type AuthMethodName } from '@services/auth-method-config';
import { Box, Divider, Stack } from '@styled/jsx';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

type Props = {
  appId: string;
  appType: AppType;
  authMethodName: AuthMethodName;
};

export const MagicLoginCard = ({ appId, appType, authMethodName }: Props) => {
  const router = useRouter();
  const { createToast } = useToast();
  const { trackAction } = useAnalytics();
  const open = useAppAuthMethodEnabledModal((state) => state.open);
  const openDisableModal = useAppAuthMethodDisableModal((state) => state.open);

  const metadata = APP_AUTH_METHODS_METADATA[authMethodName];
  const Icon = metadata.icon;

  const { data: authMethods, isPending } = useAuthMethodsSuspenseQuery(
    appQueryKeys.authMethods({
      appId,
      appType,
    }),
  );

  const { mutateAsync: updateAppAuthMethod } = useUpdateAppAuthMethodMutation({
    onSuccess: (_, params) => {
      const message = `${metadata.label} ${params.isActive ? 'enabled' : 'disabled'}`;

      trackAction(message, { ...params });

      if (!params.isActive) {
        createToast({
          message: `${metadata.label} disabled`,
          variant: 'neutral',
        });
      }
    },
    onError: (error, params, context) => {
      const message = `Failed to ${params.isActive ? 'enable' : 'disable'} ${metadata.label}`;

      logger.error(message, { params, context }, error);
      createToast({
        message,
        variant: 'error',
      });
    },
  });

  const isEnabled = useMemo(() => {
    return Boolean(authMethods.find((v) => v.name === authMethodName && v.is_active));
  }, [authMethodName, authMethods]);

  const handleEnable = async () => {
    await updateAppAuthMethod({
      appId,
      appType,
      name: authMethodName,
      isActive: true,
    });

    open(authMethodName);
  };

  const handleDisable = () => {
    openDisableModal(authMethodName, appId, appType);
  };

  const handleClickCustomEmailProvider = () => {
    router.push(`/app/settings?cid=${appId}#custom-email-provider`);
  };

  return (
    <AuthMethodCard enabled={isEnabled}>
      <AuthMethodCard.Icon>
        <Icon width={30} height={30} />
      </AuthMethodCard.Icon>
      <AuthMethodCard.Label>{metadata.label} login</AuthMethodCard.Label>
      <AuthMethodCard.Action>
        {isEnabled ? (
          <Popover variant="text" trigger="click">
            <Popover.LeadingIcon>
              <IcoKebab />
            </Popover.LeadingIcon>
            <Popover.Content>
              <Stack gap={1.5}>
                <SwitchCase
                  value={authMethodName}
                  caseBy={{
                    [APP_AUTH_METHOD_NAMES.LINK]: (
                      <>
                        <Link href={metadata.docUrl} target="_blank" rel="noreferrer">
                          <Button variant="text" size="sm" label="Build a demo">
                            <Button.TrailingIcon>
                              <IcoExternalLink />
                            </Button.TrailingIcon>
                          </Button>
                        </Link>

                        <Divider color="neutral.tertiary" />

                        <Link
                          href={'https://magic.link/docs/api-reference/client-side-sdks/web#loginwithemailotp'}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="text" size="sm" label="Choose auth mode">
                            <Button.TrailingIcon>
                              <IcoExternalLink />
                            </Button.TrailingIcon>
                          </Button>
                        </Link>

                        <Divider color="neutral.tertiary" />

                        <Button
                          variant="text"
                          size="sm"
                          label="Custom email provider"
                          onPress={handleClickCustomEmailProvider}
                        />
                      </>
                    ),
                  }}
                  defaultComponent={
                    <Link href={metadata.docUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="text" size="sm" label="Docs">
                        <Button.TrailingIcon>
                          <IcoExternalLink />
                        </Button.TrailingIcon>
                      </Button>
                    </Link>
                  }
                />

                <Divider color="neutral.tertiary" />

                <Box>
                  <Button
                    variant="text"
                    textStyle="negative"
                    size="sm"
                    label="Disable"
                    onPress={handleDisable}
                    disabled={isPending}
                  />
                </Box>
              </Stack>
            </Popover.Content>
          </Popover>
        ) : (
          <Button size="sm" label="Enable" onPress={handleEnable} validating={isPending} />
        )}
      </AuthMethodCard.Action>
    </AuthMethodCard>
  );
};
