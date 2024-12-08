import { useAppRouteMatches } from '@components/hooks/router-hooks';
import { Button, Text } from '@magiclabs/ui-components';
import { Box, HStack, Stack } from '@styled/jsx';
import { useRouter } from 'next/navigation';
import { useCallback, useRef } from 'react';

type Props = {
  to: string;
  isMatch: boolean;
  label: string;
  newFeature?: boolean;
};

const AccountSideNavLink = (props: Props) => {
  const { isMatch, label, to, newFeature } = props;
  const router = useRouter();
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = useCallback(() => {
    router.push(to);
  }, [router, to]);

  return (
    <HStack
      onClick={() => buttonRef.current?.click()}
      cursor="pointer"
      position="relative"
      gap={2}
      px={8}
      py={2.5}
      w="full"
      transition="filter 0.1s ease"
      _hover={{ filter: !isMatch ? 'brightness(0)' : undefined }}
      smDown={{ p: '9px 0px 9px 30px' }}
    >
      <Button
        variant="text"
        textStyle={isMatch ? undefined : 'subtle'}
        label={label}
        onPress={handleClick}
        ref={buttonRef}
      />
      {newFeature && (
        <Box
          px={2}
          py={1.5}
          w="fit-content"
          bg="brand.lightest"
          rounded="md"
          color="brand.darker"
          fontSize="10px"
          lineHeight={1}
        >
          NEW
        </Box>
      )}
      {isMatch && (
        <Box
          position="absolute"
          left="-4px"
          bg="brand.base"
          w={2}
          h={8}
          rounded="2xl"
          my={1}
          smDown={{ display: 'none' }}
        />
      )}
    </HStack>
  );
};

export const AccountSideNav = () => {
  const { isPlanAndBillingRoute, isAccountTeamRoute } = useAppRouteMatches();
  return (
    <Stack
      justifyContent="space-between"
      h="full"
      bg="surface.primary"
      smDown={{ w: 'full', minH: 'unset', overflowX: 'scroll', justifyContent: 'center' }}
    >
      <Stack
        gap={0}
        pt="15px"
        w="15rem"
        bg="surface.primary"
        smDown={{ pt: 0, w: 'full', flexDir: 'row', zIndex: 100 }}
      >
        <Box px="30px" py="15px" smDown={{ display: 'none' }}>
          <Text.H4 fontWeight="medium">Account</Text.H4>
        </Box>
        <AccountSideNavLink to="/account/billing" isMatch={isPlanAndBillingRoute} label="Billing" />
        <AccountSideNavLink to="/account/team" isMatch={isAccountTeamRoute} label="Team" />
      </Stack>
    </Stack>
  );
};
