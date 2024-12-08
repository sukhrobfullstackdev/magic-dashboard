'use client';

import { useMagicLDFlags } from '@components/contexts/launch-darkly-provider';
import { useAppRouteMatches } from '@components/hooks/router-hooks';
import { BetaTag } from '@components/presentation/beta-tag';
import { SwitchCase } from '@components/presentation/switch-case';
import { CONNECT_APP, PASSPORT_APP } from '@constants/appInfo';
import { NavTypes } from '@constants/nav';
import { useCurrentApp } from '@hooks/common/use-current-app';
import { useAppInfoSuspenseQuery } from '@hooks/data/app';
import { appQueryKeys } from '@hooks/data/app/keys';
import { type AppInfo } from '@hooks/data/app/types';
import { type App } from '@hooks/data/user/types';
import { isDedicatedApp } from '@libs/is-dedicated-app';
import {
  Button,
  IcoAsteriskWithShield,
  IcoCaretDown,
  IcoEmailOpen,
  IcoHome,
  IcoPasswordless,
  IcoSettings,
  IcoShapes,
  IcoShieldApproved,
  IcoUsers,
} from '@magiclabs/ui-components';
import { Box, HStack, Stack } from '@styled/jsx';
import { token } from '@styled/tokens';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ElementType, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { kebabCase } from 'tiny-case';

type MenuItem = {
  type: NavTypes;
  url: string;
  route: boolean;
  label: string;
  isVisible?: boolean;
  Icon?: ElementType;
  inBeta?: boolean;
  children?: MenuItem[];
};

export const useMenuList = ({ appInfo: { appId, appType, featureFlags } }: { appInfo: AppInfo }): MenuItem[] => {
  // appType = PASSPORT_APP;
  const { isLoginDebuggingEnabled } = useMagicLDFlags();

  const {
    isHomeRoute,
    isUsersRoute,
    isEventLogsRoute,
    isBrandingRoute,
    isEmailCustomizationRoute,
    isSocialLoginSettings,
    isSettingsRoute,
    isAuthLoginSettings,
    isMfaSettings,
    isWidgetUIRoute,
    isWalletProvidersRoute,
    isGasSubsidyRoute,
    isNftCheckoutRoute,
    isCustomizationRoute,
  } = useAppRouteMatches();

  return [
    {
      type: NavTypes.LINK,
      url: `/app?cid=${appId}`,
      route: isHomeRoute,
      label: 'Home',
      isVisible: true,
      Icon: IcoHome,
    },
    {
      type: NavTypes.LINK,
      url: `/app/users?cid=${appId}`,
      route: isUsersRoute,
      label: 'Users',
      isVisible: appType !== PASSPORT_APP,
      Icon: IcoUsers,
    },
    {
      type: NavTypes.LINK,
      url: `/app/event_logs?cid=${appId}`,
      route: isEventLogsRoute,
      label: 'Email Logs',
      isVisible: isDedicatedApp(appType) && isLoginDebuggingEnabled,
      Icon: IcoEmailOpen,
      inBeta: false,
    },
    {
      type: NavTypes.FOLDER,
      url: '#',
      route: isAuthLoginSettings || isSocialLoginSettings || isWalletProvidersRoute,
      isVisible: appType !== PASSPORT_APP,
      label: 'Authentication',
      Icon: IcoPasswordless,
      children: [
        {
          type: NavTypes.LINK,
          url: `/app/magic_login?cid=${appId}`,
          route: isAuthLoginSettings,
          label: 'Passwordless',
          isVisible: isDedicatedApp(appType),
        },
        {
          type: NavTypes.LINK,
          url: `/app/social_login?cid=${appId}`,
          route: isSocialLoginSettings,
          label: 'Social Logins',
          isVisible: isDedicatedApp(appType),
        },
        {
          type: NavTypes.LINK,
          url: `/app/wallet_providers?cid=${appId}`,
          route: isWalletProvidersRoute,
          label: 'Third-party Wallets',
          isVisible: appType === CONNECT_APP,
        },
      ],
    },
    {
      type: NavTypes.LINK,
      url: `/app/customization?cid=${appId}`,
      route: isCustomizationRoute,
      label: 'Customization',
      isVisible: appType === PASSPORT_APP,
      Icon: IcoShapes,
    },
    {
      type: NavTypes.FOLDER,
      url: '#',
      route: isBrandingRoute || isWidgetUIRoute,
      isVisible: appType !== PASSPORT_APP,
      label: 'Customization',
      Icon: IcoShapes,
      children: [
        {
          type: NavTypes.LINK,
          url: `/app/branding?cid=${appId}`,
          route: isBrandingRoute,
          label: 'Branding',
          isVisible: true,
        },
        {
          type: NavTypes.LINK,
          url: `/app/email_customization?cid=${appId}`,
          route: isEmailCustomizationRoute,
          label: 'Email',
          isVisible: isDedicatedApp(appType),
        },
        {
          type: NavTypes.LINK,
          url: `/app/widget_ui?cid=${appId}`,
          route: isWidgetUIRoute,
          label: 'UI Widgets',
          isVisible: isDedicatedApp(appType),
        },
      ],
    },
    {
      type: NavTypes.LINK,
      url: `/app/mfa?cid=${appId}`,
      route: isMfaSettings,
      label: 'Multi-factor Auth',
      isVisible: isDedicatedApp(appType),
      Icon: IcoShieldApproved,
    },
    {
      type: NavTypes.FOLDER,
      url: '#',
      route: isGasSubsidyRoute || isNftCheckoutRoute,
      isVisible: appType !== PASSPORT_APP,
      label: 'Blockchain',
      Icon: IcoAsteriskWithShield,
      children: [
        {
          type: NavTypes.LINK,
          url: `/app/gasless?cid=${appId}`,
          route: isGasSubsidyRoute,
          label: 'Gas Subsidy',
          isVisible: featureFlags.is_gasless_transactions_enabled,
        },
      ],
    },
    {
      type: NavTypes.LINK,
      url: `/app/settings?cid=${appId}`,
      route: isSettingsRoute,
      label: 'Settings',
      isVisible: true,
      Icon: IcoSettings,
    },
  ];
};

const chevronVariants = {
  close: {
    rotate: 0,
    y: 2,
    transition: {
      duration: 0.3,
    },
  },
  open: {
    rotate: 180,
    y: -2,
    transition: {
      duration: 0.3,
    },
  },
};

type MenuProps = MenuItem & {
  level: number;
};

type MenuGroupProps = MenuItem & {
  isOpened: boolean;
  level: number;
};

const Menu = (props: MenuProps) => {
  const router = useRouter();
  const { route: isMatch, label, Icon, url, isVisible, inBeta, level } = props;
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isVisible) {
      router.prefetch(url);
    }
  }, [router, url, isVisible]);

  const handleClick = useCallback(() => {
    router.push(url);
  }, [router, url]);

  if (!isVisible) return null;

  return (
    <HStack
      position="relative"
      onClick={() => buttonRef.current?.click()}
      cursor="pointer"
      pl={6}
      pr={4}
      h={level === 0 ? 12 : 10}
      style={{ marginLeft: `${level * 40}px` }}
      transition="filter 0.1s ease"
      _hover={{ filter: !isMatch ? 'brightness(0)' : undefined }}
    >
      <HStack gap={3}>
        {Icon && <Icon color={token(`colors.${isMatch ? 'brand.base' : 'text.tertiary'}`)} />}
        <Button
          id={`btn-nav-${kebabCase(label)}`}
          variant="text"
          textStyle={isMatch ? undefined : 'subtle'}
          size="sm"
          label={label}
          iconSize={26}
          onPress={handleClick}
          ref={buttonRef}
        />
      </HStack>
      {isMatch && level === 0 && (
        <Box position="absolute" left="-4px" bg="brand.base" w={2} h={8} rounded="2xl" my={1} />
      )}
      {inBeta && <BetaTag sizeVariant="small" />}
    </HStack>
  );
};

const MenuGroup = (props: MenuGroupProps) => {
  const { isOpened, label, Icon, children, level, isVisible } = props;
  const [opened, setOpened] = useState<boolean>(isOpened);
  const buttonRef = useRef<HTMLButtonElement>(null);

  if (!isVisible) return null;

  return (
    <Stack gap={0}>
      <HStack
        h={12}
        pl={6}
        pr={4}
        justifyContent="space-between"
        onClick={() => buttonRef.current?.click()}
        cursor="pointer"
        transition="filter 0.1s ease"
        _hover={{ filter: 'brightness(0)' }}
      >
        <HStack gap={3}>
          {Icon && <Icon color={token('colors.text.tertiary')} />}
          <Button
            id={`btn-nav-group-${kebabCase(label)}`}
            variant="text"
            textStyle="subtle"
            size="sm"
            label={label}
            iconSize={24}
            onPress={() => setOpened((prev) => !prev)}
            ref={buttonRef}
          />
        </HStack>
        <motion.div initial="close" animate={opened ? 'open' : 'close'} variants={chevronVariants}>
          <IcoCaretDown width={16} height={16} color={token('colors.text.tertiary')} />
        </motion.div>
      </HStack>

      <AnimatePresence mode="popLayout">
        {opened && (
          <motion.div key={`${label}-group`} initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            {children?.map((v) => <Menu key={v.label} {...v} level={level + 1} />)}
          </motion.div>
        )}
      </AnimatePresence>
    </Stack>
  );
};

const Resolved = ({ app }: { app: App }) => {
  const { data: appInfo } = useAppInfoSuspenseQuery(
    appQueryKeys.info({
      appId: app.appId,
      appType: app.appType,
    }),
  );

  const menuList = useMenuList({
    appInfo,
  });

  const openedFolder = useMemo(
    () => menuList.find((ni) => ni.type === NavTypes.FOLDER && ni.route)?.label ?? '',
    [menuList],
  );

  return (
    <Stack gap={0}>
      {menuList.map((navItem) => (
        <SwitchCase
          key={navItem.label + navItem.type}
          value={navItem.type}
          caseBy={{
            [NavTypes.LINK]: <Menu {...navItem} level={0} />,
            [NavTypes.FOLDER]:
              Number(navItem?.children?.filter((v) => v.isVisible).length) > 0 ? (
                <MenuGroup isOpened={openedFolder === navItem.label} {...navItem} level={0} />
              ) : null,
          }}
        />
      ))}
    </Stack>
  );
};

export const AppSideNav = () => {
  const { currentApp } = useCurrentApp();

  return currentApp && <Resolved app={currentApp} />;
};
