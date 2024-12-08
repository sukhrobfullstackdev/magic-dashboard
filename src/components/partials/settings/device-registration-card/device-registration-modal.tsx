import { TextArea } from '@components/inputs/text-area';
import { Modal, ModalCloseButton } from '@components/presentation/modal/modal';
import {
  Button,
  DropdownOption,
  DropdownSelector,
  IcoCheckmark,
  IconWarningShield,
  Text,
} from '@magiclabs/ui-components';
import { HStack, Stack } from '@styled/jsx';
import { token } from '@styled/tokens';
import { useState } from 'react';

type DeviceRegistrationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onDisableDeviceRegistration: (reason: string) => void;
};

export const DeviceRegistrationModal = ({
  isOpen,
  onClose,
  onDisableDeviceRegistration,
}: DeviceRegistrationModalProps) => {
  const [reasonForDisabling, setReasonForDisabling] = useState('');
  const [otherReasonInput, setOtherReasonInput] = useState('');
  const isMobilePortrait = window.matchMedia('( max-width: 500px )')?.matches;

  const handleSelectChange = (val: string) => {
    setReasonForDisabling(val);
  };

  return (
    <Modal in={isOpen}>
      <ModalCloseButton handleClose={onClose} />
      <Stack gap={8}>
        <Stack gap={4}>
          <IconWarningShield width={48} height={48} />
          <Text.H3>Disable Device Registration?</Text.H3>
          <Text>A quick one-time email verification can help protect users against phishing attacks</Text>
          <HStack gap={4} mt={2}>
            <IcoCheckmark width={16} height={16} color={token('colors.brand.base')} />
            <Text>Only enforced for returning users</Text>
          </HStack>
          <HStack gap={4}>
            <IcoCheckmark width={16} height={16} color={token('colors.brand.base')} />
            <Text>Themed UI; Customizable intro view</Text>
          </HStack>
        </Stack>

        <Stack gap={4}>
          <DropdownSelector
            onSelect={handleSelectChange}
            label="Reason for disabling"
            selectedValue={reasonForDisabling}
          >
            <DropdownOption value="Limited UI/brand customization" label="Limited UI/brand customization" />
            <DropdownOption value="Feature is not working as expected" label="Feature is not working as expected" />
            <DropdownOption value="Adds too many steps to sign-in flow" label="Adds too many steps to sign-in flow" />
            <DropdownOption value="Confusing user experience" label="Confusing user experience" />
            <DropdownOption value="Other" label="Other" />
          </DropdownSelector>
          {reasonForDisabling === 'Other' && (
            <TextArea
              height={isMobilePortrait ? '80px' : '112px'}
              onChange={(e) => setOtherReasonInput(e.target.value)}
            />
          )}
        </Stack>

        <HStack w="full" justifyContent="end" gap={4}>
          <Button onPress={onClose} size={isMobilePortrait ? 'sm' : 'md'} label="Stay protected" variant="neutral" />
          <Button
            onPress={() =>
              onDisableDeviceRegistration(reasonForDisabling === 'Other' ? otherReasonInput : reasonForDisabling)
            }
            size={isMobilePortrait ? 'sm' : 'md'}
            label="Disable"
            variant="negative"
          />
        </HStack>
      </Stack>
    </Modal>
  );
};
