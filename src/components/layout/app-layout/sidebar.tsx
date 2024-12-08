import { AppDropdown } from '@components/layout/app-layout/app-dropdown';
import { AppSideNav } from '@components/layout/app-layout/app-side-nav';
import { useCurrentApp } from '@hooks/common/use-current-app';
import { Box, HStack } from '@styled/jsx';

export const Sidebar = () => {
  const { currentApp } = useCurrentApp();

  return (
    <>
      {/* app navigation */}
      <HStack
        h="4.75rem"
        w="full"
        px={6}
        boxSizing="border-box"
        borderBottomWidth="thin"
        borderBottomColor="neutral.tertiary"
      >
        <AppDropdown />
      </HStack>

      {/* app menus */}
      {currentApp && (
        <Box py={4}>
          <AppSideNav />
        </Box>
      )}
    </>
  );
};
