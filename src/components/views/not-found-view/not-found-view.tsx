'use client';

import { Button, Text } from '@magiclabs/ui-components';
import { Box, VStack } from '@styled/jsx';
import { token } from '@styled/tokens';
import { useRouter } from 'next/navigation';

export const NotFoundView = () => {
  const router = useRouter();

  return (
    <Box position="fixed" w="full" h="full" bg="black">
      <VStack
        gap={20}
        position="fixed"
        w="30%"
        top="30%"
        left={0}
        right={0}
        mx="auto"
        textAlign="center"
        zIndex={3}
        mdDown={{ width: '80%' }}
      >
        <Text.H1 fontWeight="semibold" styles={{ fontSize: '7.5rem', color: token('colors.chalk') }}>
          404
        </Text.H1>
        <VStack gap={8}>
          <Text.H3 fontWeight="semibold" styles={{ color: token('colors.chalk') }}>
            Sorry, that page does not exist
          </Text.H3>
          <Button size="lg" label="Go Home" onPress={() => router.push('/app/all_apps')} />
        </VStack>
      </VStack>
    </Box>
  );
};
