import { useAnalytics } from '@components/hooks/use-analytics';
import { FormCard } from '@components/presentation/form-card';
import { useUpdateAppInfoMutation } from '@hooks/data/app';
import { type AppInfo } from '@hooks/data/app/types';
import { logger } from '@libs/datadog';
import { Callout, IcoShieldApproved, IcoShieldRejected, Switch, Text, useToast } from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { Box, HStack, Stack } from '@styled/jsx';
import { token } from '@styled/tokens';
import { useEffect, useState } from 'react';

type Props = {
  appInfo: AppInfo;
};

export const SignConfirmationCard = ({ appInfo }: Props) => {
  const [isReadOnlyViewActive, setIsReadOnlyViewActive] = useState(true);
  const { createToast } = useToast();
  const { trackAction } = useAnalytics();

  const isTransactionConfirmationEnabled = appInfo.featureFlags.is_transaction_confirmation_enabled;

  const [signConfirmationToggleEnabled, setSignConfirmationToggleEnabled] = useState(false);

  // when the response comes back from the server, set the toggle to the value from the server
  useEffect(() => {
    if (isTransactionConfirmationEnabled !== undefined) {
      setSignConfirmationToggleEnabled(Boolean(isTransactionConfirmationEnabled));
    }
  }, [isTransactionConfirmationEnabled]);

  const { mutateAsync: updateAppInfo, isPending } = useUpdateAppInfoMutation({
    onSuccess: () => {
      const status = signConfirmationToggleEnabled ? 'enabled' : 'disabled';
      trackAction(`Magic link sign confirmation ${status}`, { appId: appInfo.appId });
      createToast({
        message: `Magic link security check has been ${status}.`,
        variant: 'success',
      });
    },
    onError: (error, params, context) => {
      const status = signConfirmationToggleEnabled ? 'enabled' : 'disabled';
      const message = `Error with sign confirmation toggle set to: ${status}`;
      logger.error(message, { params, context }, error);
      createToast({
        message,
        variant: 'error',
      });
    },
  });

  const closeEditView = () => {
    setSignConfirmationToggleEnabled((prev) => !prev);
    setIsReadOnlyViewActive(true);
  };

  const handleSave = async () => {
    await updateAppInfo({
      appId: appInfo.appId,
      appType: appInfo.appType,
      featureFlags: {
        is_transaction_confirmation_enabled: signConfirmationToggleEnabled,
      },
    });

    setIsReadOnlyViewActive(true);
  };

  const handleSignConfirmationToggle = () => {
    setSignConfirmationToggleEnabled((prev) => !prev);
  };

  const handleEdit = () => {
    setIsReadOnlyViewActive(false);
  };

  const infoText = (
    <Box maxW="31.25rem">
      <Text fontColor="text.tertiary">
        When Signature Request UI is used, help protect users by enabling them to confirm in a new browser tab.
      </Text>
    </Box>
  );

  const registrationDisabledWarning = (
    <Callout
      variant="warning"
      label="Magic recommends enabling Sign Confirmation to help protect users from front-end attacks. Learn More"
      onPress={() => window.open('https://magic.link/docs/wallets/security/sign-confirmation', '_blank', 'noreferrer')}
    />
  );

  return (
    <Box id="card-sign-confirmation">
      <FormCard
        id="sign-confirmation"
        title="Sign Confirmation"
        onEdit={handleEdit}
        onSave={handleSave}
        onCancel={closeEditView}
        isReadOnlyView={isReadOnlyViewActive}
        isFormValid={isTransactionConfirmationEnabled !== signConfirmationToggleEnabled}
        readonlyView={
          <Stack gap={6}>
            <Stack gap={8}>
              {infoText}

              {isTransactionConfirmationEnabled ? (
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
            {!isTransactionConfirmationEnabled && registrationDisabledWarning}
          </Stack>
        }
        editView={
          <Stack gap={8}>
            {infoText}
            <Stack gap={4}>
              <Stack gap={2}>
                <HStack justifyContent="space-between">
                  <Text fontWeight="semibold">Enable confirmation in new tab</Text>
                  <Switch
                    onPress={handleSignConfirmationToggle}
                    checked={signConfirmationToggleEnabled}
                    disabled={isPending}
                  />
                </HStack>

                <Text fontColor="text.tertiary">
                  <a
                    className={css({ color: 'brand.base', fontWeight: 600 })}
                    href="https://magic.link/docs/wallets/security/sign-confirmation"
                    target="_blank"
                    rel="noreferrer"
                  >
                    View docs
                  </a>{' '}
                  for example UX and more details
                </Text>
              </Stack>
              {!signConfirmationToggleEnabled && registrationDisabledWarning}
            </Stack>
          </Stack>
        }
      />
    </Box>
  );
};
