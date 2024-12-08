'use client';

import { useExpand } from '@components/hooks/transitions';
import { useAnalytics } from '@components/hooks/use-analytics';
import { DEFAULT_APP_LOGO_SRC } from '@constants/appInfo';
import { useCurrentApp } from '@hooks/common/use-current-app';
import { useKeyDown } from '@hooks/common/use-keydown';
import { useUniversalProBundle } from '@hooks/common/use-universal-pro-bundle';
import { useAppInfoSuspenseQuery } from '@hooks/data/app';
import { appQueryKeys } from '@hooks/data/app/keys';
import { userQueryKeys } from '@hooks/data/user/keys';
import { UserInfo, type App } from '@hooks/data/user/types';
import {
  THEME_BRANDING_DEFAULT_VALUE,
  THEME_BRANDING_HIDE_MAGIC_LOGO_VALUE,
  type CustomBrandingType,
  type LogoFile,
} from '@interfaces/client';
import { isDedicatedApp } from '@libs/is-dedicated-app';
import { colorContrastStandardsLink, magicPreviewLink } from '@libs/link-resolvers';
import { Button, Card, IcoDismiss, IcoWand, IcoWarningFill, Switch, Text, useToast } from '@magiclabs/ui-components';
import { confirmUpdateTheme, uploadMagicClientLogo } from '@services/branding';
import { css } from '@styled/css';
import { Box, Center, Circle, Flex, HStack, Stack, VStack } from '@styled/jsx';
import { hstack, stack } from '@styled/patterns';
import { token } from '@styled/tokens';
import { useQueryClient } from '@tanstack/react-query';
import { useDebounce } from '@uidotdev/usehooks';
import Color from 'color';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FC,
  type PropsWithChildren,
} from 'react';

interface PreviewProps {
  title: string;
  desc: string;
  type: 'email' | 'modal' | 'confirm';
  query: string;
}

const Preview = ({ title, desc, type, query }: PreviewProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const ref = useRef<HTMLIFrameElement | null>(null);
  const isEmail = type === 'email';

  const initialQuery = useMemo(() => query, []);

  useEffect(() => {
    if (ref.current && isLoaded) {
      const iframeWin = ref.current.contentWindow;
      if (iframeWin) iframeWin.postMessage({ msgType: 'update', payload: query }, '*');
    }
  }, [query, isLoaded]);

  useEffect(() => {
    const handleEventListener = (e: MessageEvent) => {
      if (e.data?.msgType === 'PreviewChannelReady' && e.data?.previewType === `/preview/${type}`) {
        setIsLoaded(true);
      }
    };

    window.addEventListener('message', handleEventListener);

    return () => {
      window.removeEventListener('message', handleEventListener);
    };
  }, [type]);

  return (
    <Stack gap={0} w="330px" mb={6}>
      <Stack mb={5}>
        <Text fontWeight="semibold">{title}</Text>
        <Text size="sm" fontColor="text.secondary">
          {desc}
        </Text>
      </Stack>
      {type === 'confirm' && <img src="/images/browser_top_confirm.svg" alt="" />}
      {type === 'modal' && <img src="/images/browser_top_your_app.svg" alt="" />}
      <Box
        h={isEmail ? '436px' : '350px'}
        w="328px"
        overflow="hidden"
        rounded="sm"
        background="surface.primary"
        boxShadow="0px 0px 30px #00000026"
        pointerEvents="none"
      >
        <iframe
          sandbox="allow-scripts allow-same-origin"
          className={css({
            h: isEmail ? '872px' : '700px',
            w: isEmail ? '660px' : '656px',
            transform: isEmail ? 'scale(0.6)' : 'scale(0.5)',
            transformOrigin: 'top left',
          })}
          title="preview iframe"
          src={magicPreviewLink(`/${type}?params=${initialQuery}`).href}
          ref={ref}
        />
      </Box>
    </Stack>
  );
};

interface AttributeProps {
  title: string;
  disabled?: boolean;
}

const Attribute: FC<PropsWithChildren<AttributeProps>> = ({ title, children, disabled }) => {
  return (
    <VStack gap={2} opacity={disabled ? 0.3 : 1} pointerEvents={disabled ? 'none' : 'auto'}>
      <Text size="sm" fontWeight="semibold">
        {title}
      </Text>
      {children}
    </VStack>
  );
};

const Resolved = ({ app }: { app: App }) => {
  const router = useRouter();
  const { trackAction } = useAnalytics();
  const queryClient = useQueryClient();
  const { createToast } = useToast();

  const { data: appInfo } = useAppInfoSuspenseQuery(appQueryKeys.info({ appId: app.appId, appType: app.appType }));

  const { universalProBundle } = useUniversalProBundle({
    teamId: app.teamId,
  });

  const isConnectPremiumEnabled = Boolean(universalProBundle);

  const { is_default_asset, asset_uri, button_color, theme_color, custom_branding_type } = appInfo.themeInfo;

  const [brandColorHex, setBrandColorHex] = useState('#6851FF'); // @magic
  const debouncedColorHex = useDebounce(brandColorHex, 750) ?? brandColorHex;
  const [logoFile, setLogoFile] = useState<LogoFile>({});
  const [shouldRemoveLogo, setShouldRemoveLogo] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [userPickedColor, setUserPickedColor] = useState(false);
  const [saveErrorMessage, setSaveErrorMessage] = useState('');
  const [customBrandingType, setCustomBrandingType] = useState<CustomBrandingType>(THEME_BRANDING_DEFAULT_VALUE);

  useEffect(() => {
    if (asset_uri) setLogoFile({ asset_uri, is_default_asset });
    if (button_color) setBrandColorHex(button_color);
    if (theme_color) setIsDarkTheme(theme_color === 'dark');
    if (custom_branding_type) setCustomBrandingType(custom_branding_type);
  }, [asset_uri, button_color, theme_color, custom_branding_type, is_default_asset]);

  const styleQuery = useMemo(
    () =>
      encodeURI(
        JSON.stringify({
          color: debouncedColorHex.substring(1),
          appName: appInfo?.appName ?? 'First App',
          themeType: isDarkTheme ? 'dark' : 'light',
          logoImage: logoFile.asset_uri,
          customBrandingType,
        }),
      ),
    [debouncedColorHex, appInfo?.appName, isDarkTheme, logoFile.asset_uri, customBrandingType],
  );

  const uploadFile = useCallback(async () => {
    const fileInput = document.getElementById('file-picker') as HTMLInputElement;
    const file = fileInput.files?.[0];
    const fd = new FormData();

    if (!file) return;

    if (file.size > 512000) {
      setSaveErrorMessage('Max file size 512 KB');
      return;
    }

    fd.set('image', file);

    const { data, error } = await uploadMagicClientLogo(fd);
    await queryClient.invalidateQueries({
      queryKey: appQueryKeys.info({ appId: app.appId, appType: app.appType }),
    });

    if (error) {
      setSaveErrorMessage('Upload Failed. Try again later!');

      createToast({
        message: 'Upload Failed. Try again later!',
        variant: 'error',
      });
      return;
    }

    setLogoFile({ ...data, is_default_asset: false });
    setShouldRemoveLogo(false);
    setIsDirty(true);
    setSaveErrorMessage('');
  }, []);

  const setColorFromInput = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (/^#([A-Fa-f0-9]{0,6}|[A-Fa-f0-9]{0,3})$/.test(e.target.value) && e.target.value !== brandColorHex) {
        setBrandColorHex(e.target.value);
        setIsDirty(true);
        setUserPickedColor(true);
      }
    },
    [brandColorHex],
  );

  const setColorFromPicker = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.value !== brandColorHex) {
        setBrandColorHex(e.target.value);
        setIsDirty(true);
        setUserPickedColor(true);
      }
    },
    [brandColorHex],
  );

  const showContrastWarning = useMemo(() => {
    try {
      return (Color(brandColorHex).isDark() ? 'dark' : 'light') === (isDarkTheme ? 'dark' : 'light');
    } catch {
      return false;
    }
  }, [brandColorHex, isDarkTheme]);

  const saveTheme = async () => {
    setSaveErrorMessage('');

    if (!app.appId) return;

    const { error } = await confirmUpdateTheme(
      app.appId,
      logoFile.asset_path ?? '',
      isDarkTheme ? 'dark' : 'light',
      brandColorHex.toUpperCase(),
      shouldRemoveLogo,
      customBrandingType,
    );

    if (error) {
      setSaveErrorMessage('Failed to save changes. Try again later!');

      return;
    }

    await queryClient.invalidateQueries({
      queryKey: appQueryKeys.info({ appId: app.appId, appType: app.appType }),
    });

    queryClient.setQueryData(userQueryKeys.info(), (prev: UserInfo) => ({
      ...prev,
      apps: prev.apps.map((v) =>
        v.appId === app.appId ? { ...v, appLogoUrl: logoFile.asset_uri ?? DEFAULT_APP_LOGO_SRC } : v,
      ),
    }));

    setIsDirty(false);
    setShouldRemoveLogo(false);

    trackAction('Branding Saved', { brandColorHex, isDarkTheme, logoImage: logoFile.asset_path });

    createToast({
      message: 'Saved!',
      variant: 'success',
    });
  };

  const getExpandProps = useExpand();

  const removeLogoFile = useCallback(() => {
    const fileInput = document.getElementById('file-picker') as HTMLInputElement;

    setLogoFile({ asset_path: '' });
    setIsDirty(true);
    setShouldRemoveLogo(true);
    fileInput.value = '';
  }, []);

  const displayAuthAppBranding = isDedicatedApp(app.appType);
  const isMCPlusLocked = !displayAuthAppBranding && !isConnectPremiumEnabled;

  const handleClickCustomEmailProvider = () => {
    router.push(`/app/settings?cid=${app.appId}#custom-email-provider`);
  };

  const handleClickLight = useCallback(() => {
    if (isMCPlusLocked) return;
    setIsDarkTheme(false);
    setIsDirty(true);
    setBrandColorHex(userPickedColor ? brandColorHex : '#6851FF');
  }, []);

  const handleClickDark = useCallback(() => {
    if (isMCPlusLocked) return;
    setIsDarkTheme(true);
    setIsDirty(true);
    setBrandColorHex(userPickedColor ? brandColorHex : '#A799FF');
  }, []);

  return (
    <Stack gap={6} p={8}>
      <Card className={stack({ p: 12, gap: 6 })}>
        <Flex justifyContent="space-between" mdDown={{ flexDirection: 'column', gap: 4 }}>
          <Text.H3>Branding</Text.H3>
          <VStack>
            <Flex
              gap={8}
              wrap="wrap"
              justifyContent="end"
              mdDown={{ w: 'full', justifyContent: 'space-between', gap: 2 }}
            >
              <Attribute title="LOGO">
                <Box
                  w="3.25rem"
                  h="3.25rem"
                  position="relative"
                  borderWidth="thin"
                  borderColor="neutral.primary"
                  rounded="full"
                  overflow="hidden"
                >
                  {logoFile.asset_uri && !logoFile.is_default_asset ? (
                    <Center w="full" h="full">
                      <Circle
                        id="btn-logo"
                        role="button"
                        position="absolute"
                        w="full"
                        h="full"
                        onClick={removeLogoFile}
                        // eslint-disable-next-line react-hooks/rules-of-hooks
                        onKeyDown={useKeyDown(removeLogoFile, ['Enter'])}
                        tabIndex={0}
                        cursor="pointer"
                        opacity={0}
                        _hover={{
                          opacity: 1,
                          bg: 'radial-gradient(50% 50% at 50% 50%, hsla(0, 0%, 100%, 0.45) 0, hsla(0, 0%, 100%, 0.72) 100%)',
                        }}
                      >
                        <IcoDismiss width={26} height={26} color={token('colors.text.secondary')} />
                      </Circle>
                      {/* skipcq: JS-W1015 */}
                      <img
                        src={logoFile.asset_uri}
                        className={css({ w: '3.25rem', h: '3.25rem', objectFit: 'contain' })}
                        alt="uploaded logo"
                      />
                    </Center>
                  ) : (
                    <Center w="full" h="full">
                      <Image width={48} height={48} src={DEFAULT_APP_LOGO_SRC} alt="default app logo" />
                    </Center>
                  )}

                  <input
                    className={css({
                      position: 'absolute',
                      cursor: 'pointer',
                      rounded: 'full',
                      top: 0,
                      left: 0,
                      w: 'full',
                      h: 'full',
                      overflow: 'hidden',
                      display: logoFile.asset_uri && !logoFile.is_default_asset ? 'none' : 'inline-block',
                      fontSize: 0,
                    })}
                    id="file-picker"
                    type="file"
                    name="file-picker"
                    accept="image/png, image/jpeg"
                    onChange={uploadFile}
                  />
                </Box>
              </Attribute>

              <Attribute title="PRIMARY COLOR" disabled={isMCPlusLocked}>
                <HStack
                  w="8.25rem"
                  p={2.5}
                  borderWidth="thin"
                  borderColor="neutral.primary"
                  rounded="full"
                  position="relative"
                >
                  <input
                    id="color-input"
                    className={css({
                      w: 16,
                      overflow: 'visible',
                      fontSize: 'sm',
                      fontWeight: 500,
                      outline: 'none',
                      bg: 'transparent',
                    })}
                    value={brandColorHex}
                    onChange={setColorFromInput}
                    disabled={isMCPlusLocked}
                  />
                  <Circle w={8} h={8} position="relative" style={{ background: brandColorHex }}>
                    <input
                      className={css({
                        opacity: 0,
                        position: 'absolute',
                        cursor: 'pointer',
                        rounded: 'full',
                        top: 0,
                        left: 0,
                        w: 'full',
                        h: 'full',
                        border: 'none',
                        overflow: 'hidden',
                      })}
                      id="color-picker"
                      type="color"
                      value={brandColorHex}
                      onChange={setColorFromPicker}
                      disabled={isMCPlusLocked}
                    />
                  </Circle>
                </HStack>
              </Attribute>

              <Attribute title="THEME" disabled={isMCPlusLocked}>
                <Flex
                  px="0.4375rem"
                  py={1.5}
                  borderWidth="thin"
                  borderColor="neutral.primary"
                  bg="neutral.secondary"
                  rounded="full"
                  position="relative"
                >
                  <Box
                    id="btn-mode-light"
                    role="button"
                    cursor="pointer"
                    color="text.primary"
                    fontSize="sm"
                    fontWeight={500}
                    rounded="full"
                    px="0.9375rem"
                    py="0.5625rem"
                    transition="all 0.2s"
                    bg={!isDarkTheme ? 'surface.primary' : 'transparent'}
                    onClick={handleClickLight}
                    onKeyDown={useKeyDown(handleClickLight, ['Enter'])}
                    tabIndex={0}
                  >
                    Light
                  </Box>
                  <Box
                    id="btn-mode-dark"
                    role="button"
                    cursor="pointer"
                    color={isDarkTheme ? 'surface.primary' : 'text.primary'}
                    fontSize="sm"
                    fontWeight={500}
                    rounded="full"
                    px="0.9375rem"
                    py="0.5625rem"
                    transition="all 0.2s"
                    bg={isDarkTheme ? 'text.primary' : 'transparent'}
                    onClick={handleClickDark}
                    onKeyDown={useKeyDown(handleClickDark, ['Enter'])}
                    tabIndex={0}
                  >
                    Dark
                  </Box>
                </Flex>
              </Attribute>
              <VStack mt={8} maxW="5.375rem">
                <Button label="Save" onPress={saveTheme} disabled={!isDirty} />
              </VStack>
            </Flex>
            {saveErrorMessage && (
              <Text size="sm" variant="error" styles={{ textAlign: 'center' }}>
                {saveErrorMessage}
              </Text>
            )}
          </VStack>
        </Flex>
        <AnimatePresence>
          {showContrastWarning && (
            <motion.div
              className={hstack({ minW: '200px', justifyContent: 'flex-end', alignItems: 'center' })}
              {...getExpandProps()}
            >
              <IcoWarningFill color={token('colors.negative.base')} />
              <Text size="sm" fontWeight="bold">
                LOW CONTRAST
              </Text>{' '}
              <Text size="sm">
                We recommend you use another theme with your primary color for better accessibility.
              </Text>
              <a
                className={css({
                  fontWeight: 500,
                  color: 'brand.base',
                  transition: 'color 0.1s ease',
                  _hover: { color: 'brand.lighter' },
                })}
                {...colorContrastStandardsLink}
              >
                Learn More
              </a>
            </motion.div>
          )}
        </AnimatePresence>

        {displayAuthAppBranding && (
          <>
            <HStack justifyContent="space-between">
              <Text fontWeight="medium">Show Magic logo in footer of UI Widgets</Text>
              <Switch
                checked={customBrandingType === THEME_BRANDING_DEFAULT_VALUE}
                onChange={() => {
                  setCustomBrandingType((prevState) =>
                    prevState === THEME_BRANDING_DEFAULT_VALUE
                      ? THEME_BRANDING_HIDE_MAGIC_LOGO_VALUE
                      : THEME_BRANDING_DEFAULT_VALUE,
                  );

                  setIsDirty(true);
                }}
              />
            </HStack>
            <HStack bg="neutral.quaternary" color="text.primary" p="0.625rem 1.125rem" rounded={10}>
              <IcoWand width={20} height={20} />
              <HStack gap={1}>
                <Text> Customize email sender name and address by configuring a</Text>
                <Button variant="text" label="custom email provider" onPress={handleClickCustomEmailProvider} />
              </HStack>
            </HStack>
          </>
        )}
      </Card>

      <Card className={stack({ p: 12, gap: 8 })}>
        <Text.H3>Previews</Text.H3>
        <Flex wrap="wrap" justifyContent="space-between" gap={10}>
          {displayAuthAppBranding ? (
            <>
              <Preview
                title="Magic Link Email"
                desc="The email your users will receive after they submit their email address"
                type="email"
                query={styleQuery}
              />
              <Preview
                title="Confirmation Page"
                desc="What your users will see after they click on the Magic Link"
                type="confirm"
                query={styleQuery}
              />
              <Preview
                title="Pending Page"
                desc="What your users will see from your app after they request a Magic Link email"
                type="modal"
                query={styleQuery}
              />
            </>
          ) : (
            <>
              <Preview
                title="Login"
                desc="Users can connect using an email address, Google account, or an existing web3 wallet"
                type="email"
                query={styleQuery}
              />
              <Preview
                title="Login Email"
                desc="Users who log in via email will receive a 6-digit one-time passcode"
                type="confirm"
                query={styleQuery}
              />
              <Preview
                title="Signature request"
                desc="Transaction signing events use your logo and app name to build trust with users"
                type="modal"
                query={styleQuery}
              />
            </>
          )}
        </Flex>
      </Card>
    </Stack>
  );
};

export const BrandingView = () => {
  const { currentApp } = useCurrentApp();

  return currentApp && <Resolved app={currentApp} />;
};
