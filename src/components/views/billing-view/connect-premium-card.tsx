import { Dropdown } from '@components/presentation/dropdown';
import { Modal, ModalCloseButton } from '@components/presentation/modal/modal';
import { ADDONS_LABEL, ADDONS_SM_ICON, CONNECT_ADDONS } from '@constants/addons';
import { APP_LABEL, CONNECT_APP } from '@constants/appInfo';
import { useUniversalProBundle, type UniversalProBundle } from '@hooks/common/use-universal-pro-bundle';
import { useUserInfoSuspenseQuery } from '@hooks/data/user';
import { userQueryKeys } from '@hooks/data/user/keys';
import { getDisplayDate } from '@libs/get-display-date';
import { magicSupportLink } from '@libs/link-resolvers';
import { Button, IcoKebab, Text } from '@magiclabs/ui-components';
import { Box, Divider, HStack, VStack } from '@styled/jsx';
import { token } from '@styled/tokens';
import Image from 'next/image';
import { Suspense, useMemo, useState } from 'react';

const UniversalLogo = APP_LABEL[CONNECT_APP].Logo;

type Props = {
  teamId: string;
};

const InnerResolved = ({ teamId, universalProBundle }: { teamId: string; universalProBundle: UniversalProBundle }) => {
  const [isDropdownOpened, setIsDropdownOpened] = useState(false);
  const [isModalOpened, setIsModalOpened] = useState(false);

  const { data: userInfo } = useUserInfoSuspenseQuery(userQueryKeys.info());
  const universalAppName = useMemo(() => {
    const app = userInfo.apps.filter((v) => v.teamId === teamId).find((fApp) => fApp.appType === CONNECT_APP);
    return app ? app.appName : '';
  }, [teamId, userInfo.apps]);

  const handleUnsubscribe = () => {
    setIsModalOpened(true);
    setIsDropdownOpened(false);
  };

  const trialEndDateLabel = getDisplayDate(universalProBundle.trialEnd);
  const periodEndDateLabel = getDisplayDate(universalProBundle.currentPeriodEnd);

  const cardDescription = useMemo(
    () =>
      universalProBundle.trialEnd && new Date() < universalProBundle.trialEnd
        ? `Free trial ends on ${trialEndDateLabel}`
        : `Billed next on ${periodEndDateLabel}`,
    [periodEndDateLabel, universalProBundle.trialEnd, trialEndDateLabel],
  );

  if (!universalProBundle) {
    return null;
  }

  return (
    <VStack gap={4} maxWidth={'368px'} alignItems={'stretch'} w={'100%'}>
      <HStack justifyContent="space-between">
        <HStack gap={1.5}>
          <UniversalLogo color={token('colors.text.tertiary')} width={12} height={12} />
          <Text
            size="sm"
            fontColor="text.tertiary"
            fontWeight="semibold"
            styles={{
              letterSpacing: '0.5px',
              fontSize: '10px',
            }}
          >
            UNIVERSAL
          </Text>
        </HStack>
        <Text size="sm" fontColor="text.tertiary">
          {universalAppName}
        </Text>
      </HStack>

      <Box px={8} py={6} bgColor="surface.primary">
        <VStack alignItems="stretch" gap={1}>
          <HStack justifyContent="space-between" alignItems="center">
            <Image src={ADDONS_SM_ICON.COLORED[CONNECT_ADDONS]} alt="" />
            <Dropdown
              opened={isDropdownOpened}
              setOpened={setIsDropdownOpened}
              placement="right"
              button={
                <Button variant="text" onPress={() => setIsDropdownOpened((s) => !s)}>
                  <Button.LeadingIcon>
                    <IcoKebab />
                  </Button.LeadingIcon>
                </Button>
              }
            >
              <a {...magicSupportLink}>
                <Button variant="text" size="sm" label="Support" />
              </a>
              <Divider color="neutral.tertiary" pt={3} mb={3} />
              <Button onPress={handleUnsubscribe} size="sm" variant="text" textStyle="negative" label="Unsubscribe" />
            </Dropdown>
          </HStack>
          <Text fontWeight="semibold">{ADDONS_LABEL[CONNECT_ADDONS]}</Text>
          <HStack justifyContent="space-between" alignItems="center">
            <Text size="sm" fontColor="text.tertiary">
              {cardDescription}
            </Text>
            <Box p="6px 8px" bgColor={'positive.lightest'} borderRadius={'6px'}>
              <Text
                size="sm"
                fontWeight="semibold"
                styles={{
                  fontSize: '10px',
                  color: token('colors.positive.darkest'),
                  lineHeight: 1,
                }}
              >
                ACTIVE
              </Text>
            </Box>
          </HStack>
        </VStack>

        <Modal in={isModalOpened}>
          <ModalCloseButton handleClose={() => setIsModalOpened(false)} />
          <VStack gap={4} alignItems={'stretch'}>
            <Text>
              Contact{' '}
              <a
                href="mailto:support@magic.link?subject=Cancel Universal Pro bundle"
                style={{
                  color: token('colors.brand.base'),
                  textDecoration: 'none',
                  fontWeight: 700,
                }}
              >
                support@magic.link
              </a>{' '}
              for assistance.
            </Text>
          </VStack>
        </Modal>
      </Box>
    </VStack>
  );
};

const Resolved = ({ teamId }: Props) => {
  const { universalProBundle } = useUniversalProBundle({
    teamId,
  });

  return universalProBundle && <InnerResolved teamId={teamId} universalProBundle={universalProBundle} />;
};

export const ConnectPremiumCard = (props: Props) => {
  return (
    <Suspense>
      <Resolved {...props} />
    </Suspense>
  );
};
