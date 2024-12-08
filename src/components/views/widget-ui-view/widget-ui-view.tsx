'use client';

import { useMagicLDFlags } from '@components/contexts/launch-darkly-provider';
import { useAnalytics } from '@components/hooks/use-analytics';
import { WidgetUICard } from '@components/partials/widget-ui-card';
import { useCurrentApp } from '@hooks/common/use-current-app';
import { useAppInfoSuspenseQuery, useUpdateAppInfoMutation } from '@hooks/data/app';
import { appQueryKeys } from '@hooks/data/app/keys';
import { type App } from '@hooks/data/user/types';
import { type WidgetFeatures } from '@interfaces/client';
import { Card, IcoOpenBook, IcoQuestionCircleFill, IcoShield, Switch, Text, Tooltip } from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { Box, Grid, HStack, Stack } from '@styled/jsx';
import { token } from '@styled/tokens';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo } from 'react';

const Resolved = ({ app }: { app: App }) => {
  const { trackAction } = useAnalytics();

  const { isTransactionSigningUiToggleDisabled } = useMagicLDFlags();
  const { data: appInfo } = useAppInfoSuspenseQuery(
    appQueryKeys.info({
      appId: app.appId,
      appType: app.appType,
    }),
  );
  const { mutateAsync: updateAppInfo } = useUpdateAppInfoMutation();

  const isNftViewerEnabled = appInfo.featureFlags.is_nft_viewer_enabled;
  const isNftTransferEnabled = appInfo.featureFlags.is_nft_transfer_enabled;
  const isFiatOnrampEnabled = appInfo.featureFlags.is_fiat_onramp_enabled;
  const isSendTransactionUiEnabled = appInfo.featureFlags.is_send_transaction_ui_enabled;
  const isSigningUiEnabled = appInfo.featureFlags.is_signing_ui_enabled;

  const updateToggles = async (updatedToggles: WidgetFeatures) => {
    const deltaFeaturesObj = {
      ...appInfo.featureFlags,
      ...updatedToggles,
    };

    await updateAppInfo({
      appId: appInfo.appId,
      appType: appInfo.appType,
      featureFlags: deltaFeaturesObj,
    });
  };

  const walletUiCarouselImgUrls = useMemo(() => {
    const images = [];

    if (isNftViewerEnabled && isFiatOnrampEnabled) {
      images.push({ path: '/images/widget_ui/example_ui/wallet_ui/1_1.svg', alt: 'wallet-ui-nft-onramp' });
    } else if (!isNftViewerEnabled && isFiatOnrampEnabled) {
      images.push({ path: '/images/widget_ui/example_ui/wallet_ui/1_2.svg', alt: 'wallet-ui-onramp' });
    } else if (isNftViewerEnabled && !isFiatOnrampEnabled) {
      images.push({ path: '/images/widget_ui/example_ui/wallet_ui/1_3.svg', alt: 'wallet-ui-nft' });
    } else {
      images.push({ path: '/images/widget_ui/example_ui/wallet_ui/1_4.svg', alt: 'wallet-ui' });
    }

    if (isNftViewerEnabled) {
      images.push({ path: '/images/widget_ui/example_ui/show_nft.svg', alt: 'show-nft' });

      if (isNftTransferEnabled) {
        images.push({ path: '/images/widget_ui/example_ui/nft_transfer.svg', alt: 'nft-transfer' });
      }
    }

    if (isFiatOnrampEnabled) {
      images.push({ path: '/images/widget_ui/example_ui/fiat_on_ramp.svg', alt: 'show-onramp' });
    }

    return images;
  }, [isNftViewerEnabled, isNftTransferEnabled, isFiatOnrampEnabled]);

  const txnCarouselImgUrls = useMemo(() => {
    return [
      { path: '/images/widget_ui/example_ui/txn/send_txn.svg', alt: 'send-transaction' },
      { path: '/images/widget_ui/example_ui/txn/sign_pesonal_message.svg', alt: 'personal-sign' },
    ];
  }, []);

  return (
    <Card paddingType="lg">
      <Stack gap={6}>
        <Stack gap={2} mb={4}>
          <Text.H3>UI Widgets</Text.H3>
          <Text fontColor="text.tertiary">Customize your experience with production-ready UI.</Text>
        </Stack>

        <Grid gap={6} gridTemplateColumns="repeat(2, 1fr)" lgDown={{ display: 'flex', flexDir: 'column' }}>
          <WidgetUICard
            title="Wallet View"
            descriptions={[
              'User-friendly flows for managing tokens and NFTs',
              'Support on Ethereum, Polygon, Base, Arbitrum, and Optimism',
            ]}
            docsLink="https://magic.link/docs/connect/features/wallet-widget"
            carouselImgList={walletUiCarouselImgUrls}
            subFeatures={[
              {
                label: 'NFT UI',
                description: 'View NFT Collection',
                checked: Boolean(isNftViewerEnabled),
                onPress: () => {
                  trackAction(`UI Widgets: Updated NFT Viewer Feature Toggle: ${!isNftViewerEnabled}`);
                  updateToggles({
                    is_nft_viewer_enabled: !isNftViewerEnabled,
                  });
                },
              },
              {
                label: 'NFT Transfer',
                description: 'Allow users to send NFTs to wallets outside your app',
                checked: Boolean(isNftTransferEnabled),
                onPress: () => {
                  trackAction(`UI Widgets: Updated NFT Transfer Feature Toggle: ${!isNftTransferEnabled}`);
                  updateToggles({
                    is_nft_transfer_enabled: !isNftTransferEnabled,
                  });
                },
                disabled: !isNftViewerEnabled,
              },
              {
                label: 'Fiat On-Ramps',
                description:
                  'Purchase crypto via ACH transfer, card, and more. Available for US residents (excluding Hawaii) on Ethereum and Polygon blockchains',
                checked: Boolean(isFiatOnrampEnabled),
                onPress: () => {
                  trackAction(`UI Widgets: Updated Fiat Onramp Feature Toggle: ${!isFiatOnrampEnabled}`);
                  updateToggles({
                    is_fiat_onramp_enabled: !isFiatOnrampEnabled,
                  });
                },
                disabled: false,
                children: (
                  <Tooltip
                    content={
                      <Text inline size="sm" fontColor="text.tertiary">
                        Alternative fiat-on ramp options with more blockchain and country support is available to
                        enterprise clients,&nbsp;
                        <a
                          href="https://magic.link/contact"
                          target="_blank"
                          rel="noreferrer"
                          className={css({ color: 'brand.base', fontWeight: 600 })}
                        >
                          contact us
                        </a>
                        &nbsp;to get access.
                      </Text>
                    }
                  >
                    <IcoQuestionCircleFill color={token('colors.neutral.primary')} width={18} height={18} />
                  </Tooltip>
                ),
              },
            ]}
          />

          <WidgetUICard
            title="Signature Request UI"
            descriptions={[
              'Support sign typed data V1, V3 and V4',
              'Support on Ethereum, Polygon, Base, Arbitrum, and Optimism',
            ]}
            docsLink="https://magic.link/docs/connect/features/transaction-signing"
            carouselImgList={txnCarouselImgUrls}
            rightIcon={
              <Switch
                disabled={isTransactionSigningUiToggleDisabled}
                checked={isSendTransactionUiEnabled}
                onPress={() => {
                  trackAction(
                    `UI Widgets: Updated Send Transaction + Sign Data UI Feature Toggle: ${!isSendTransactionUiEnabled}`,
                  );
                  updateToggles({
                    is_send_transaction_ui_enabled: !isSendTransactionUiEnabled,
                    is_signing_ui_enabled: !isSigningUiEnabled,
                  });
                }}
              />
            }
            callout={
              <HStack justifyContent="space-between" bg="neutral.tertiary" p={6} gap={5} rounded="xl">
                <IcoShield className={css({ minW: 6 })} />
                <Text>
                  To improve security against front-end attacks, enable the{' '}
                  <Link
                    href={`/app/settings?cid=${appInfo.appId}#sign-confirmation`}
                    className={css({ color: 'brand.base', fontWeight: 600, whiteSpace: 'nowrap' })}
                  >
                    Sign Confirmation
                  </Link>{' '}
                  in settings
                </Text>
              </HStack>
            }
          />
        </Grid>

        <HStack
          bg="neutral.quaternary"
          px={5}
          py={3}
          gap={3}
          rounded="xl"
          smDown={{ flexWrap: 'wrap', justifyContent: 'center', textAlign: 'center' }}
        >
          <IcoOpenBook width={15} height={15} className={css({ minW: 4 })} color={token('colors.text.secondary')} />
          <Text>
            More UI Widgets are available out of the box. To learn more about SDK methods,&nbsp;
            <a
              href="https://magic.link/docs/auth/more/widget-ui"
              target="_blank"
              rel="noreferrer"
              className={css({ color: 'brand.base', fontWeight: 600 })}
            >
              {'read on Docs ->'}
            </a>
          </Text>
          <Image
            width={256}
            height={120}
            style={{ margin: '0 0 -30px 10%' }}
            src="/images/widget_ui/callout_card.svg"
            alt=""
          />
        </HStack>
      </Stack>
    </Card>
  );
};

export const WidgetUIView = () => {
  const { currentApp } = useCurrentApp();

  return (
    currentApp && (
      <Box m={6}>
        <Resolved app={currentApp} />
      </Box>
    )
  );
};
