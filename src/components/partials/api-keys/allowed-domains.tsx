import { useCountAllowedDomains } from '@components/hooks/use-count-allowed-domains';
import { Button, Callout, IcoArrowRight, IcoShield, Text } from '@magiclabs/ui-components';
import { HStack } from '@styled/jsx';
import { token } from '@styled/tokens';
import { useRouter } from 'next/navigation';

type AllowedDomainsProps = {
  appId: string;
  isAllowlistEnforced: boolean;
};

export const AllowedDomains = ({ appId, isAllowlistEnforced }: AllowedDomainsProps) => {
  const router = useRouter();

  const { count } = useCountAllowedDomains({
    appId,
  });

  const handleManage = (anchor?: string, isEditView = false): React.MouseEventHandler<HTMLAnchorElement> => {
    const editableQuery = isEditView ? '&edit=true' : '';
    router.push(`app/settings/?cid=${appId}${editableQuery}#${anchor}`);
    return () => {};
  };

  return count < 1 ? (
    <Callout
      icon
      variant="warning"
      onPress={() => handleManage('allowlist-card', true)}
      label={
        isAllowlistEnforced
          ? 'Configure a domain allowlist to use keys on a live public domain'
          : 'Your API key is vulnerable. Enable relevant allowlists to protect their usage.'
      }
    />
  ) : (
    <HStack justifyContent="space-between">
      <HStack>
        <IcoShield width={24} height={24} color={token('colors.text.tertiary')} />
        <Text size="sm" fontColor="text.tertiary">
          {count > 1 ? `${count} domains/mobile bundles/redirects` : `${count} domain/mobile bundle/redirect`} allowed
        </Text>
      </HStack>
      <Button id="btn-manage" variant="text" label="Manage" onPress={() => handleManage('allowlist-card', true)}>
        <Button.TrailingIcon>
          <IcoArrowRight />
        </Button.TrailingIcon>
      </Button>
    </HStack>
  );
};
