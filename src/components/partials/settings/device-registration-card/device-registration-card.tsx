import { DeviceRegistrationModal } from '@components/partials/settings/device-registration-card/device-registration-modal';
import { FormCard } from '@components/presentation/form-card';
import { Callout, IcoShieldApproved, IcoShieldRejected, Switch, Text, useToast } from '@magiclabs/ui-components';
import * as ClientService from '@services/client';
import * as DeviceVerificationService from '@services/device-verification';
import { css } from '@styled/css';
import { Box, HStack, Stack } from '@styled/jsx';
import { token } from '@styled/tokens';
import { useEffect, useState } from 'react';

type Props = {
  magic_client_id: string;
  live_secret_key: string;
};

export const DeviceRegistrationCard = ({ magic_client_id: client_id, live_secret_key }: Props) => {
  const { createToast } = useToast();
  const [isReadOnlyViewActive, setIsReadOnlyViewActive] = useState(true);
  const [deviceVerificationEnabled, setDeviceVerificationEnabled] = useState(false);
  const [deviceRegistrationToggleEnabled, setDeviceRegistrationToggleEnabled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const getClientInfo = async () => {
      const { device_verification_enabled } = await ClientService.getClientInfo(client_id!);
      setDeviceVerificationEnabled(device_verification_enabled!);
      setDeviceRegistrationToggleEnabled(device_verification_enabled!);
    };

    getClientInfo();
  }, [client_id]);

  const closeEditView = () => {
    setDeviceRegistrationToggleEnabled(deviceVerificationEnabled);
    setIsReadOnlyViewActive(true);
  };

  const handleSave = () => {
    if (!deviceRegistrationToggleEnabled) {
      setIsModalOpen(true);
    } else {
      DeviceVerificationService.patchDeviceVerification(client_id!, live_secret_key!, true);
      setDeviceVerificationEnabled(true);
      setIsReadOnlyViewActive(true);
      createToast({
        message: 'Device Registration enabled',
        variant: 'success',
      });
    }
  };

  const handleDisableDeviceRegistration = (reason: string) => {
    DeviceVerificationService.patchDeviceVerification(client_id!, live_secret_key!, false, reason);
    setDeviceVerificationEnabled(false);
    setIsModalOpen(false);
    setIsReadOnlyViewActive(true);
    createToast({
      message: 'Device Registration disabled',
      variant: 'neutral',
    });
  };

  const infoText = (
    <Box maxW="31.25rem">
      <Text fontColor="text.tertiary">
        Help protect users by requiring additional email confirmation when a login is initiated from an unrecognized
        device or browser.
      </Text>
    </Box>
  );

  const registrationDisabledWarning = (
    <Callout
      variant="warning"
      label="Magic strongly recommends enabling Device Registration to help protect users from phishing attacks. Learn More"
      onPress={() => window.open('https://magic.link/posts/magic-commitment-product-security', '_blank', 'noreferrer')}
    />
  );

  return (
    <Box id="card-device-registration">
      <FormCard
        title="Device Registration"
        onEdit={() => setIsReadOnlyViewActive(false)}
        onSave={handleSave}
        onCancel={closeEditView}
        isReadOnlyView={isReadOnlyViewActive}
        isFormValid={deviceVerificationEnabled !== deviceRegistrationToggleEnabled}
        readonlyView={
          <Stack gap={6}>
            <Stack gap={8}>
              {infoText}

              {deviceVerificationEnabled ? (
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
            {!deviceVerificationEnabled && registrationDisabledWarning}
          </Stack>
        }
        editView={
          <Stack gap={8}>
            {infoText}
            <Stack gap={4}>
              <Stack gap={2}>
                <HStack justifyContent="space-between">
                  <Text fontWeight="semibold">Enforce device registration</Text>
                  <Switch
                    onPress={() => setDeviceRegistrationToggleEnabled((prevState) => !prevState)}
                    checked={deviceRegistrationToggleEnabled}
                  />
                </HStack>

                <Text fontColor="text.tertiary">
                  <a
                    className={css({ color: 'brand.base', fontWeight: 600 })}
                    href="https://magic.link/docs/dedicated/more/device-registration"
                    target="_blank"
                    rel="noreferrer"
                  >
                    View docs
                  </a>{' '}
                  for example UX and more details
                </Text>
              </Stack>
              {!deviceRegistrationToggleEnabled && registrationDisabledWarning}
            </Stack>
            <DeviceRegistrationModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onDisableDeviceRegistration={handleDisableDeviceRegistration}
            />
          </Stack>
        }
      />
    </Box>
  );
};
