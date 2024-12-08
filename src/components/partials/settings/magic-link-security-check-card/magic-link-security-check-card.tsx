import { useAnalytics } from '@components/hooks/use-analytics';
import { FormCard } from '@components/presentation/form-card';
import { useSetSecurityOtpFlagMutation } from '@hooks/data/app';
import { type AppInfo } from '@hooks/data/app/types';
import { logger } from '@libs/datadog';
import { IcoShieldApproved, IcoShieldRejected, Switch, Text, useToast } from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { Box, HStack, Stack } from '@styled/jsx';
import { token } from '@styled/tokens';
import { useState } from 'react';

type Props = {
  appInfo: AppInfo;
};

export const MagicLinkSecurityCheckCard = ({ appInfo }: Props) => {
  const { trackAction } = useAnalytics();
  const { createToast } = useToast();
  const [isReadOnlyViewActive, setIsReadOnlyViewActive] = useState(true);
  const [securityCheckEnabled, setSecurityCheckEnabled] = useState(appInfo.etcFlags.is_security_otp_enabled);

  const isSecurityOtpEnabled = appInfo.etcFlags.is_security_otp_enabled;
  const { mutateAsync: setSecurityOtpFlag, isPending } = useSetSecurityOtpFlagMutation({
    onSuccess: () => {
      const status = securityCheckEnabled ? 'enabled' : 'disabled';
      trackAction(`Magic link security OTP ${status}`, { appId: appInfo.appId });
      createToast({
        message: `Magic link security check has been ${status}.`,
        variant: 'success',
      });
    },
    onError: (error, params, context) => {
      const status = securityCheckEnabled ? 'enabled' : 'disabled';
      const message = `There was an issue setting magic link security check to ${status}.`;
      logger.error(message, { params, context }, error);
      createToast({
        message,
        variant: 'error',
      });
    },
    onSettled: () => {
      setIsReadOnlyViewActive(true);
    },
  });

  const closeEditView = () => {
    setSecurityCheckEnabled(isSecurityOtpEnabled);
    setIsReadOnlyViewActive(true);
  };

  const handleSave = async () => {
    await setSecurityOtpFlag({
      appId: appInfo.appId,
      appType: appInfo.appType,
      enabled: securityCheckEnabled,
    });

    setIsReadOnlyViewActive(true);
  };

  const infoText = (
    <Box maxW="31.25rem">
      <Text fontColor="text.tertiary">
        When Magic Link authentication is used, help protect users by enabling them to confirm their login with security
        code.
      </Text>
    </Box>
  );

  return (
    <Box id="card-magic-link-security-check">
      <FormCard
        title="Magic Link Security Check"
        onEdit={() => setIsReadOnlyViewActive(false)}
        onSave={handleSave}
        onCancel={closeEditView}
        isReadOnlyView={isReadOnlyViewActive}
        isFormValid={isSecurityOtpEnabled !== securityCheckEnabled}
        readonlyView={
          <Stack gap={8}>
            {infoText}

            {isSecurityOtpEnabled ? (
              <HStack gap={2}>
                <IcoShieldApproved color={token('colors.positive.darker')} />
                <Text fontWeight="bold" styles={{ color: token('colors.positive.darker') }}>
                  Enabled
                </Text>
              </HStack>
            ) : (
              <HStack gap={2}>
                <IcoShieldRejected color={token('colors.text.tertiary')} />
                <Text fontColor="text.tertiary" fontWeight="bold">
                  Disabled
                </Text>
              </HStack>
            )}
          </Stack>
        }
        editView={
          <Stack gap={8}>
            {infoText}
            <Stack gap={2}>
              <HStack justifyContent="space-between">
                <Text fontWeight="semibold">Enable security check on login</Text>
                <Switch
                  onPress={() => setSecurityCheckEnabled((prevState) => !prevState)}
                  checked={securityCheckEnabled}
                  disabled={isPending}
                />
              </HStack>

              <Text fontColor="text.tertiary">
                <a
                  className={css({ color: 'brand.base', fontWeight: 600 })}
                  href="https://magic.link/docs/authentication/security/magic-link-security-check"
                  target="_blank"
                  rel="noreferrer"
                >
                  View docs
                </a>{' '}
                for example UX and more details
              </Text>
            </Stack>
          </Stack>
        }
      />
    </Box>
  );
};
