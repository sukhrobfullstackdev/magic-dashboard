import { useDisableMfaModal } from '@components/views/users-view/disable-mfa-modal';
import { Button, IcoKebab, IcoShieldApproved, IcoShieldRejected, Popover } from '@magiclabs/ui-components';
import { HStack } from '@styled/jsx';
import { token } from '@styled/tokens';

type Props = {
  enabled: boolean;
  userId: string;
  authUserId: string;
};

export const MfaDropdown = ({ enabled, userId, authUserId }: Props) => {
  const open = useDisableMfaModal((state) => state.open);

  const handleDisableMfa = () => {
    open(userId, authUserId);
  };

  return enabled ? (
    <HStack gap={0}>
      <IcoShieldApproved color={token('colors.brand.base')} />
      <Popover variant="text" textStyle="neutral" size="sm" trigger="click">
        <Popover.LeadingIcon>
          <IcoKebab />
        </Popover.LeadingIcon>
        <Popover.Content>
          <Button size="sm" variant="text" textStyle="negative" label="Disable MFA" onPress={handleDisableMfa} />
        </Popover.Content>
      </Popover>
    </HStack>
  ) : (
    <IcoShieldRejected color={token('colors.neutral.primary')} />
  );
};
