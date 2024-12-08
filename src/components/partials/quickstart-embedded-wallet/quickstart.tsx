import { useAnalytics } from '@components/hooks/use-analytics';
import { useLocalStorage } from '@components/hooks/use-localstorage';
import { QuickstartCLI } from '@components/partials/quickstart-embedded-wallet/quickstart/quickstart-cli';
import {
  BLOCKCHAINS,
  BLOCKCHAIN_AUTH_SELECT_OPTIONS,
  BLOCKCHAIN_CONNECT_SELECT_OPTIONS,
  QuickstartTypes,
} from '@components/partials/quickstart-embedded-wallet/quickstart/quickstart-config';
import { QuickstartLegacy } from '@components/partials/quickstart-embedded-wallet/quickstart/quickstart-legacy';
import { QuickstartRibbon } from '@components/partials/quickstart-embedded-wallet/ribbon';
import { SwitchCase } from '@components/presentation/switch-case';
import { useDismissQuickStartMutation } from '@hooks/data/app';
import { type AppInfo } from '@hooks/data/app/types';
import { logger } from '@libs/datadog';
import { isDedicatedApp } from '@libs/is-dedicated-app';
import { Card, DropdownOption, DropdownSelector, Text, useToast } from '@magiclabs/ui-components';
import { Box, HStack, Stack } from '@styled/jsx';
import { useDebounce } from '@uidotdev/usehooks';
import { useEffect, useMemo, useState } from 'react';

type Props = {
  appInfo: AppInfo;
};

export const EmbeddedWalletQuickstart = ({ appInfo }: Props) => {
  const { createToast } = useToast();
  const { trackAction } = useAnalytics();

  const [appNetworks, setAppNetworks] = useLocalStorage<Record<string, string>>('app_network', {});
  const [network, setNetwork] = useState(appNetworks[appInfo.appId] ?? 'Ethereum (Mainnet)');
  const debounceValue = useDebounce(network, 1000);

  const { mutateAsync: dismissQuickStart } = useDismissQuickStartMutation({
    onError: (error, params) => {
      logger.error('There was an issue editing quickstart config.', params, error);

      createToast({
        message: 'An error occurred',
        variant: 'error',
      });
    },
  });

  const blockchain = useMemo(() => {
    return BLOCKCHAINS[network];
  }, [network]);

  const selectOptions = useMemo(
    () => (isDedicatedApp(appInfo.appType) ? BLOCKCHAIN_AUTH_SELECT_OPTIONS : BLOCKCHAIN_CONNECT_SELECT_OPTIONS),
    [appInfo.appType],
  );

  const handleCloseDismiss = async () => {
    await dismissQuickStart({ appId: appInfo.appId, appType: appInfo.appType });
    trackAction('Quickstart Dismissed');
  };

  useEffect(() => {
    setAppNetworks({ ...appNetworks, [appInfo.appId]: debounceValue });
  }, [debounceValue]);

  return (
    <Card paddingType="none">
      <QuickstartRibbon onClose={handleCloseDismiss} appType={appInfo.appType} />

      <Stack gap={5} px={8} py={6}>
        <HStack gap={0} justifyContent="space-between">
          <Text.H4 fontWeight="semibold">Build a demo in minutes</Text.H4>
          <Box w={60}>
            <DropdownSelector size="md" onSelect={setNetwork} selectedValue={network} aria-label="network-select">
              {selectOptions.map((option) => (
                <DropdownOption key={option} value={option} label={option} />
              ))}
            </DropdownSelector>
          </Box>
        </HStack>
        <Box>
          <SwitchCase
            value={blockchain?.quickstart}
            caseBy={{
              [QuickstartTypes.CLI]: <QuickstartCLI appInfo={appInfo} network={network} />,
            }}
            defaultComponent={<QuickstartLegacy appInfo={appInfo} network={network} />}
          />
        </Box>
      </Stack>
    </Card>
  );
};
