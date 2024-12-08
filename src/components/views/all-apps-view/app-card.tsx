import { type App } from '@hooks/data/user/types';
import { Button, Card, Text } from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { Box, Center, Divider, HStack, VStack } from '@styled/jsx';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { kebabCase } from 'tiny-case';

type Props = {
  app: App;
};

const CardBox = ({ app }: Props) => {
  const [routing, setRouting] = useState(false);
  const router = useRouter();

  const handleGoToApp = useCallback(() => {
    setRouting(true);
    router.push(`/app?cid=${app.appId}`);
  }, [app.appId, router, setRouting]);

  return (
    <Card
      id={`btn-app-${kebabCase(app.appName)}`}
      key={app.appId}
      asButton
      gapType="none"
      paddingType="sm"
      stack
      onClick={handleGoToApp}
      validating={routing}
    >
      <Box pb={1}>
        <Center w={12} h={12}>
          <img src={app.appLogoUrl} alt="Logo" width={48} height={48} className={css({ rounded: 'lg' })} />
        </Center>
      </Box>
      <VStack flex={1} justifyContent="center">
        <Box lineClamp={1} maxW="140px">
          <Text fontWeight="semibold" styles={{ textAlign: 'center' }}>
            {app.appName}
          </Text>
        </Box>
      </VStack>
      {app.userCount > 0 ? (
        <>
          <Divider color="neutral.quaternary" mb={3.5} />
          <HStack justifyContent="space-between" width="full">
            <Text size="xs" fontColor="text.tertiary">
              Users
            </Text>
            <Text size="xs">{app.userCount}</Text>
          </HStack>
        </>
      ) : (
        <Button expand id="btn-get-started" label="Get Started" size="sm" onPress={() => handleGoToApp()} />
      )}
    </Card>
  );
};

export const AppCard = ({ app }: { app: App }) => {
  return <CardBox app={app} />;
};
