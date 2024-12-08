'use client';

import { ErrorBoundary } from '@components/partials/error-boundary/error-boundary';
import { useSignOutMutation, useUserInfoSuspenseQuery } from '@hooks/data/user';
import { userQueryKeys } from '@hooks/data/user/keys';
import { Animate, Button, IcoAstronaut, LoadingSpinner, Popover, Text, useToast } from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { Box, Divider, HStack, Stack } from '@styled/jsx';
import { useRouter } from 'next/navigation';
import { Suspense, useCallback, useState } from 'react';

const Fallback = () => {
  return (
    <Button disabled variant="text">
      <Button.LeadingIcon>
        <IcoAstronaut />
      </Button.LeadingIcon>
    </Button>
  );
};

const Resolved = () => {
  const router = useRouter();
  const {
    data: { email },
  } = useUserInfoSuspenseQuery(userQueryKeys.info());
  const [isOpened, setIsOpened] = useState(false);
  const { createToast } = useToast();

  const { mutateAsync: signOut, isPending } = useSignOutMutation({
    onSuccess: () => {
      createToast({
        message: 'Successfully logged out',
        variant: 'success',
      });
    },
    onError: () => {
      createToast({
        message: 'Failed to log out',
        variant: 'error',
      });
    },
  });

  const handleGoToAccount = () => {
    router.push('/account/billing');
    setIsOpened(false);
  };

  const handleOpen = () => {
    setIsOpened((open) => !open);
  };

  const handleSignOut = useCallback(async () => {
    await signOut();
  }, [signOut]);

  return (
    <Popover
      id="nav-menu-btn"
      isOpen={isOpened}
      onOpenChange={handleOpen}
      textStyle="subtle"
      trigger="click"
      variant="text"
    >
      <Popover.LeadingIcon>
        <IcoAstronaut />
      </Popover.LeadingIcon>
      <Popover.Content
        className={css({
          minWidth: '226px',
        })}
      >
        <Animate type="slide">
          <Stack w="200px" gap={3}>
            <Text truncate size="sm">
              {email}
            </Text>
            <Divider color="neutral.tertiary" />
            <Box>
              <Button id="account-btn" label="Account" size="sm" variant="text" onPress={handleGoToAccount} />
            </Box>
            {isPending ? (
              <HStack justifyContent="space-between" w="full">
                <Button disabled label="Logout" size="sm" textStyle="negative" variant="text" />
                <LoadingSpinner size={20} strokeWidth={2} />
              </HStack>
            ) : (
              <Box>
                <Button
                  id="logout-btn"
                  label="Logout"
                  size="sm"
                  textStyle="negative"
                  variant="text"
                  onPress={handleSignOut}
                />
              </Box>
            )}
          </Stack>
        </Animate>
      </Popover.Content>
    </Popover>
  );
};

export const UserDropdown = () => {
  return (
    <ErrorBoundary fallback={<Fallback />}>
      <Suspense fallback={<Fallback />}>
        <Resolved />
      </Suspense>
    </ErrorBoundary>
  );
};
