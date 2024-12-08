'use client';

import { useAnalytics } from '@components/hooks/use-analytics';
import { SecretInput } from '@components/inputs/secret-input';
import { TextArea } from '@components/inputs/text-area';
import { providerConfigs, providerNameList } from '@components/views/social-login-settings-view/provider-configs';
import { providers } from '@components/views/social-login-settings-view/providers';
import { ENV } from '@config';
import { useCurrentApp } from '@hooks/common/use-current-app';
import { useKeyDown } from '@hooks/common/use-keydown';
import { useAppInfoSuspenseQuery, useUpdateAppInfoMutation } from '@hooks/data/app';
import { appQueryKeys } from '@hooks/data/app/keys';
import { type App } from '@hooks/data/user/types';
import { MAGIC_ENDPOINTS, getOAuthMagicInstance } from '@libs/magic-sdk';
import type { OAuthProvider } from '@magic-ext/oauth2';
import {
  Button,
  IcoCode,
  IcoDoc,
  IcoExternalLink,
  IcoQuestionCircleFill,
  Popover,
  Radio,
  RadioGroup,
  Switch,
  Text,
  TextBox,
  TextInput,
  Tooltip,
  useToast,
} from '@magiclabs/ui-components';
import { createOAuthApp, deleteOAuthApp, getOAuthApps, updateOAuthApp, type OAuthClientInfo } from '@services/oauth';
import { css } from '@styled/css';
import { Box, Divider, HStack, Stack } from '@styled/jsx';
import { token } from '@styled/tokens';
import { useFlags } from 'launchdarkly-react-client-sdk';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useState,
  type Dispatch,
  type FC,
  type Reducer,
} from 'react';

// -------------------------------------------------------------------------- //
// React Components for Configuring OAuth Providers

interface OAuthCardProps {
  app: App;
  provider: providers;
  clients?: OAuthClientInfo[];
}

type OAuthCardState = {
  view: 'expanded' | 'condensed';
  isConfirmDeleteTooltipShowing: boolean;
  isLoading: boolean;
  app?: OAuthClientInfo;
  clientID: string;
  clientSecret: string;
  magicLoginExperience: string;
  metadataKid?: string;
  metadataTeamId?: string;
  autoLinkingEnabled?: boolean;
};

type OAuthCardAction =
  | { type: 'expand' }
  | { type: 'condense' }
  | { type: 'show_confirm_delete' }
  | { type: 'hide_confirm_delete' }
  | { type: 'acknowledge_confirm_delete'; payload: 'cancel' | 'disable' }
  | { type: 'loading'; payload: boolean }
  | { type: 'set_app'; payload?: OAuthClientInfo }
  | { type: 'set_client_id'; payload?: string }
  | { type: 'set_client_secret'; payload?: string }
  | { type: 'set_metadata_kid'; payload?: string }
  | { type: 'set_metadata_team_id'; payload?: string }
  | { type: 'set_auto_linking'; payload: boolean }
  | { type: 'set_magic_login_experience'; payload?: string };

const initialOAuthCardState: OAuthCardState = {
  view: 'condensed',
  isConfirmDeleteTooltipShowing: false,
  isLoading: false,
  clientID: '',
  clientSecret: '',
  magicLoginExperience: 'CUSTOM_UI',
};

const OAuthCardContext = createContext<{
  state: OAuthCardState;
  dispatch: Dispatch<OAuthCardAction>;
  provider: providers;
  clients?: OAuthClientInfo[];
}>({
  state: initialOAuthCardState,
  dispatch: () => undefined,
  provider: providers.google,
  clients: undefined,
});

/**
 * We model the shared state of an OAuth settings card using the reduer pattern.
 * The state modeled here is shared between the subcomponents of `OAuthCard`.
 */
const oauthCardReducer: Reducer<OAuthCardState, OAuthCardAction> = (state, action) => {
  switch (action.type) {
    case 'expand':
      return {
        ...state,
        view: 'expanded',
        clientID: state.app?.app_id ?? '',
        clientSecret: state.app?.app_secret ?? '',
        metadataKid: state.app?.app_metadata?.kid ?? '',
        metadataTeamId: state.app?.app_metadata?.team_id ?? '',
        magicLoginExperience: state.app?.login_experience ?? 'CUSTOM_UI',
      };

    case 'condense':
      return {
        ...state,
        view: 'condensed',
        isConfirmDeleteTooltipShowing: false,
        app: undefined,
        clientID: '',
        clientSecret: '',
        metadataKid: '',
        metadataTeamId: '',
        magicLoginExperience: 'CUSTOM_UI',
      };

    case 'show_confirm_delete':
      return { ...state, view: 'expanded', isConfirmDeleteTooltipShowing: true };

    case 'hide_confirm_delete':
      return { ...state, view: 'expanded', isConfirmDeleteTooltipShowing: false };

    case 'acknowledge_confirm_delete':
      return action.payload === 'cancel'
        ? { ...state, view: 'expanded', isConfirmDeleteTooltipShowing: false }
        : { ...state, view: 'condensed', isConfirmDeleteTooltipShowing: false };

    case 'loading':
      return { ...state, isLoading: action.payload };

    case 'set_app':
      return {
        ...state,
        app: action.payload,
        clientID: action.payload?.app_id ?? '',
        clientSecret: action.payload?.app_secret ?? '',
        metadataKid: action.payload?.app_metadata?.kid ?? '',
        metadataTeamId: action.payload?.app_metadata?.team_id ?? '',
        magicLoginExperience: action.payload?.login_experience ?? '',
      };

    case 'set_client_id':
      return { ...state, clientID: action.payload ?? state.app?.app_id ?? '' };

    case 'set_magic_login_experience':
      return { ...state, magicLoginExperience: action.payload ?? state.app?.login_experience ?? '' };

    case 'set_metadata_kid':
      return { ...state, metadataKid: action.payload ?? state.app?.app_metadata?.kid ?? '' };

    case 'set_metadata_team_id':
      return { ...state, metadataTeamId: action.payload ?? state.app?.app_metadata?.team_id ?? '' };

    case 'set_client_secret':
      return { ...state, clientSecret: action.payload ?? state.app?.app_secret ?? '' };

    case 'set_auto_linking':
      return { ...state, autoLinkingEnabled: action.payload || false };

    default:
      return state;
  }
};

/**
 * A hook for consuming/mutating OAuth card state.
 */
function useOAuthCardReducer() {
  const [state, dispatch] = useReducer(oauthCardReducer, {
    view: 'condensed',
    isConfirmDeleteTooltipShowing: false,
    isLoading: true,
    clientID: '',
    clientSecret: '',
    metadataKid: '',
    autoLinkingEnabled: false,
    magicLoginExperience: '',
  });

  return { state, dispatch };
}

function useOAuthCardContext() {
  return useContext(OAuthCardContext);
}

/**
 * Render the Form's header, announcing the OAuth provider being configured.
 */
const OAuthCardHeaderRow: FC = () => {
  const { provider } = useOAuthCardContext();
  const { trackAction } = useAnalytics();

  const providerConfig = providerConfigs[provider];

  const trackViewDemoLinkClicked = useCallback(() => {
    trackAction(`${providerConfig.labels.provider} Signin View Demo Clicked`);
  }, [providerConfig.labels.provider, trackAction]);
  const Logo = providerConfig.logo;

  return (
    <HStack justifyContent="space-between" smDown={{ flexDir: 'column', alignItems: 'start' }}>
      <HStack>
        <Logo width={30} height={30} />
        <Text.H3 fontWeight="semibold">{providerConfig.headline}</Text.H3>
      </HStack>

      {providerConfig.helpLinks.demo && (
        <a
          className={css({ mt: '5px' })}
          {...providerConfig.helpLinks.demo}
          role="link"
          tabIndex={0}
          onClick={trackViewDemoLinkClicked}
          // eslint-disable-next-line react-hooks/rules-of-hooks
          onKeyDown={useKeyDown(trackViewDemoLinkClicked, ['Enter'])}
        >
          <Button variant="text" size="sm" label="View Demos">
            <Button.LeadingIcon>
              <IcoCode />
            </Button.LeadingIcon>
          </Button>
        </a>
      )}
    </HStack>
  );
};

/**
 * Render "auto-linking toggle" if applicable
 */
const OAuthCardAutoLinking: FC = () => {
  const { provider, state, dispatch } = useOAuthCardContext();
  const { isGoogleAutoLinkingEnabled } = useFlags();
  const { enabled } = isGoogleAutoLinkingEnabled;
  const { autoLinking } = providerConfigs[provider];
  const isEnabled = provider === 'google' && enabled;

  return Boolean(autoLinking) && isEnabled ? (
    <HStack justifyContent="space-between" alignItems="start">
      <HStack>
        <Text size="sm" fontWeight="medium">
          {autoLinking?.label}
        </Text>
        <Tooltip
          content={
            <Text inline size="sm" fontColor="text.tertiary">
              Users with an “@gmail” email address will be returned the same wallet when logging in with Google or Email
              OTP
            </Text>
          }
        >
          <IcoQuestionCircleFill color={token('colors.neutral.primary')} width={18} height={18} />
        </Tooltip>
      </HStack>

      <Stack>
        <Switch
          onChange={() =>
            dispatch({
              type: 'set_auto_linking',
              payload: !state.autoLinkingEnabled,
            })
          }
          checked={state.autoLinkingEnabled}
        />
      </Stack>
    </HStack>
  ) : null;
};

/**
 * Render "How to" links related to the current provider.
 */
const OAuthCardHowToLinks: FC = () => {
  const { provider } = useOAuthCardContext();

  const providerConfig = providerConfigs[provider];

  return providerConfig.helpLinks.setup ? (
    <>
      <HStack>
        <a {...providerConfig.helpLinks.setup}>
          <Button size="sm" variant="text" label={`How to set up ${providerConfig.labels.provider} Login`}>
            <Button.LeadingIcon>
              <IcoDoc />
            </Button.LeadingIcon>
          </Button>
        </a>
      </HStack>
    </>
  ) : null;
};

/**
 * Renders a toggle switch that enables/disables the current OAuth provider.
 */
const OAuthCardEnableOrDisableCTARow = () => {
  const { currentApp } = useCurrentApp();
  const { state, dispatch, provider } = useOAuthCardContext();
  const { trackAction } = useAnalytics();

  const providerConfig = providerConfigs[provider];

  const handleSwitch = useCallback(() => {
    if (state.view === 'expanded') {
      return state.app ? dispatch({ type: 'show_confirm_delete' }) : dispatch({ type: 'condense' });
    } else if (state.view === 'condensed') {
      trackAction(`${providerConfig.labels.provider} Signin Toggle Clicked`);
      return dispatch({ type: 'expand' });
    }
    return;
  }, [dispatch, providerConfig.labels.provider, state.app, state.view, trackAction]);

  const handleClickCancel = useCallback(() => {
    dispatch({ type: 'acknowledge_confirm_delete', payload: 'cancel' });
  }, [dispatch]);

  const deleteApp = useCallback(async () => {
    if (state.app && currentApp) {
      dispatch({ type: 'loading', payload: true });
      dispatch({ type: 'hide_confirm_delete' });
      await deleteOAuthApp(state.app?.oauth_app_id, currentApp.appId);
      dispatch({ type: 'condense' });
      dispatch({ type: 'loading', payload: false });
    }

    trackAction(`${providerConfig.labels.provider} Signin Toggle Clicked`);
  }, [state.app, currentApp, trackAction, providerConfig.labels.provider, dispatch]);

  return (
    <HStack justifyContent="space-between">
      <HStack>
        <Text size="sm" fontWeight="medium">
          Enable {providerConfig.labels.provider} Sign-in
        </Text>
        {provider === 'google' && (
          <Tooltip
            content={
              <Text inline size="sm" fontColor="text.tertiary">
                Allow users to log in with Google via Magic UI widgets or your own white-label implementation
              </Text>
            }
          >
            <IcoQuestionCircleFill color={token('colors.neutral.primary')} width={18} height={18} />
          </Tooltip>
        )}
      </HStack>
      <Popover isOpen={state.isConfirmDeleteTooltipShowing}>
        <Popover.Trigger>
          <Switch onChange={handleSwitch} checked={state.view === 'expanded'} />
        </Popover.Trigger>
        <Popover.Content placement="bottom right" className={css({ maxW: '25rem' })}>
          <Stack gap={4} p={4}>
            <Text.H5>Disable {providerConfig.labels.provider} Sign-in?</Text.H5>
            <Box>
              You will no longer be able to do any actions with {providerConfig.labels.provider} Sign-in until you
              re-enable it. The client ID and secret associated to this OAuth application will be deleted.
            </Box>
            <HStack justifyContent="end">
              <Button variant="tertiary" size="sm" onPress={handleClickCancel} label="Cancel" />
              <Button variant="negative" size="sm" onPress={deleteApp} label="Disable" />
            </HStack>
          </Stack>
        </Popover.Content>
      </Popover>
    </HStack>
  );
};

/**
 * Renders the form inputs. These inputs consume the developer's client
 * ID/client secret.
 */
const OAuthCardFormInputsRow: FC = () => {
  const { state, dispatch, provider } = useOAuthCardContext();
  const { currentApp } = useCurrentApp();
  const { trackAction } = useAnalytics();

  const providerConfig = providerConfigs[provider];
  const redirectURI = new URL(`/v1/oauth2/${currentApp?.appId}/callback`, MAGIC_ENDPOINTS[ENV]).href;

  const handleClientIDInputChange = useCallback(
    (text: string) => {
      dispatch({ type: 'set_client_id', payload: text });
    },
    [dispatch],
  );

  const handleClientSecretInputChange = useCallback(
    (text: string) => {
      dispatch({ type: 'set_client_secret', payload: text });
    },
    [dispatch],
  );

  const handleMetadataKidInputChange = useCallback(
    (text: string) => {
      dispatch({ type: 'set_metadata_kid', payload: text });
    },
    [dispatch],
  );

  const handleMagicLoginExperienceChange = useCallback(
    (text: string) => {
      dispatch({ type: 'set_magic_login_experience', payload: text });
    },
    [dispatch],
  );
  const handleMetadataTeamIdInputChange = useCallback(
    (text: string) => {
      dispatch({ type: 'set_metadata_team_id', payload: text });
    },
    [dispatch],
  );

  const trackOAuthProviderClientLinkClicked = useCallback(() => {
    trackAction(`${providerConfig.labels.provider} Signin Client Link Clicked`);
  }, [providerConfig.labels.provider, trackAction]);

  const trackRedirectURICopied = useCallback(() => {
    trackAction(`${providerConfig.labels.provider} Signin Redirect URI Copied`);
  }, [providerConfig.labels.provider, trackAction]);

  const handleCopy = (value: string) => {
    navigator.clipboard.writeText(value);
    trackRedirectURICopied();
  };

  const Logo = providerConfig.logo;
  return (
    <>
      {provider === 'google' ? (
        <>
          <HStack smDown={{ alignItems: 'start', gap: 0 }}>
            <Text size="md" fontWeight="medium" fontColor="text.secondary">
              1. Create a new Google Cloud credential (OAuth Client ID):
            </Text>

            <a href={'https://console.developers.google.com/'} target="_blank" rel="noreferrer">
              <HStack smDown={{ alignItems: 'start', gap: 0 }}>
                <Text size="md" variant="info">
                  Setup on Google Cloud
                </Text>
                <IcoExternalLink width={11} height={11} color="#6851FF" />
              </HStack>
            </a>
          </HStack>

          <Text size="md" fontWeight="medium" fontColor="text.secondary">
            2. Enter Client ID and Client Secret from your new Google Cloud credential:
          </Text>

          <Stack gap={4} ml={5}>
            <TextInput
              label={providerConfig.labels.clientID}
              placeholder={`Your OAuth ${providerConfig.labels.clientID} from ${providerConfig.labels.provider}`}
              onChange={handleClientIDInputChange}
              value={state.clientID}
              aria-label="client ID"
            />

            <SecretInput
              label={providerConfig.labels.clientSecret}
              placeholder={`Your OAuth ${providerConfig.labels.clientSecret} from ${providerConfig.labels.provider}`}
              onChange={handleClientSecretInputChange}
              value={state.clientSecret}
            />
          </Stack>
          <Stack gap={4}>
            <HStack>
              <Text size="md" fontWeight="medium" fontColor={'text.secondary'}>
                3. Choose your Magic login experience
              </Text>
              <Tooltip
                content={
                  <Text inline size="sm" fontColor="text.tertiary">
                    Choose “Magic Login Widget” if you’re using the{' '}
                    <a
                      href="https://magic.link/docs/wallets/customization/widget-ui"
                      className={css({ color: 'brand.base', fontWeight: 'semibold' })}
                      target="_blank"
                      rel="noreferrer"
                    >
                      connectWithUI
                    </a>{' '}
                    SDK method.
                  </Text>
                }
              >
                <IcoQuestionCircleFill color={token('colors.neutral.primary')} width={18} height={18} />
              </Tooltip>
            </HStack>

            <Box ml={5}>
              <RadioGroup selectedValue={state.magicLoginExperience} onChange={handleMagicLoginExperienceChange}>
                <Radio value="CUSTOM_UI" label="Custom UI" />
                <Radio value="WALLET_UI" label="Magic Login Widget" />
              </RadioGroup>
            </Box>
          </Stack>
          {state.magicLoginExperience === 'CUSTOM_UI' && (
            <Text size="md" fontWeight="medium" fontColor={'text.secondary'}>
              4. In Google, <span className={css({ color: 'text.primary' })}>add your desired redirect URI</span> so
              users are returned to your app after login.
            </Text>
          )}
          {state.magicLoginExperience === 'WALLET_UI' && (
            <Stack gap={3}>
              <Text size="md" fontWeight="medium" fontColor={'text.secondary'}>
                4. In Google, add the following redirect URI:
              </Text>
              <TextBox content={redirectURI} onCopy={handleCopy} />
            </Stack>
          )}
          <Divider color="neutral.tertiary" />
          <Text size="md" fontWeight="medium" fontColor={'text.secondary'}>
            The settings need to be saved before testing connection.
          </Text>
        </>
      ) : (
        <>
          <Stack gap={6} pos="relative" p={8} pl={9} boxShadow="0 2px 6px rgba(0,0,0,.2)">
            <Box
              pos="absolute"
              h="100%"
              w="5px"
              top={0}
              left={0}
              style={{
                background: providerConfig.authCardAccentColor ?? '',
              }}
            />
            <Stack>
              <HStack
                justifyContent="space-between"
                alignItems="baseline"
                smDown={{ flexDir: 'column', alignItems: 'start', gap: 0 }}
              >
                <Text size="sm" fontWeight="medium">
                  {providerConfig.labels.clientID}
                </Text>
                {providerConfig.helpLinks.credentials && (
                  <a
                    style={{ marginTop: '5px' }}
                    {...providerConfig.helpLinks.credentials}
                    role="link"
                    tabIndex={0}
                    onClick={trackOAuthProviderClientLinkClicked}
                    // eslint-disable-next-line react-hooks/rules-of-hooks
                    onKeyDown={useKeyDown(trackOAuthProviderClientLinkClicked, ['Enter'])}
                  >
                    <Button variant="text" size="sm" label={`Get these from ${providerConfig.labels.provider}`}>
                      <Button.LeadingIcon>
                        <Logo />
                      </Button.LeadingIcon>
                    </Button>
                  </a>
                )}
              </HStack>
              <TextInput
                placeholder={`Your OAuth ${providerConfig.labels.clientID} from ${providerConfig.labels.provider}`}
                onChange={handleClientIDInputChange}
                value={state.clientID}
                aria-label="client ID"
              />
            </Stack>

            {provider === 'apple' && (
              <>
                <TextInput
                  label={providerConfig.labels.metadata?.kid}
                  placeholder={`Your OAuth ${providerConfig.labels.metadata?.kid} from ${providerConfig.labels.provider}`}
                  onChange={handleMetadataKidInputChange}
                  value={state.metadataKid}
                  aria-label="key ID"
                />
                <TextInput
                  label={providerConfig.labels.metadata?.team_id}
                  placeholder={`Your OAuth ${providerConfig.labels.metadata?.team_id} from ${providerConfig.labels.provider}`}
                  onChange={handleMetadataTeamIdInputChange}
                  value={state.metadataTeamId}
                  aria-label="team ID"
                />
              </>
            )}

            <Stack>
              <Text size="sm" fontWeight="medium">
                {providerConfig.labels.clientSecret}
              </Text>
              {provider === 'apple' ? (
                <TextArea
                  placeholder={`Your OAuth ${providerConfig.labels.clientSecret} from ${providerConfig.labels.provider}`}
                  onChange={(e) => handleClientSecretInputChange(e.target.value)}
                  value={state.clientSecret}
                  aria-label="private key"
                />
              ) : (
                <SecretInput
                  placeholder={`Your OAuth ${providerConfig.labels.clientSecret} from ${providerConfig.labels.provider}`}
                  onChange={handleClientSecretInputChange}
                  value={state.clientSecret}
                />
              )}
            </Stack>
          </Stack>

          <Stack mt={6} gap={3}>
            <HStack justifyContent="space-between" smDown={{ flexDir: 'column', alignItems: 'start', gap: 1 }}>
              <Text size="sm" fontWeight="medium">
                Redirect URI
              </Text>
              {providerConfig.helpLinks.redirectURI && (
                <a {...providerConfig.helpLinks.redirectURI}>
                  <Button
                    variant="text"
                    size="sm"
                    label={`Add this to your ${providerConfig.labels.provider} OAuth2 App`}
                  />
                </a>
              )}
            </HStack>

            <TextBox content={redirectURI} onCopy={handleCopy} />
          </Stack>
        </>
      )}
    </>
  );
};

const resetQueryString = (router: AppRouterInstance) => {
  const queryParams = new URLSearchParams(window.location.search);

  // Extract the 'cid' parameter value
  const cid = queryParams.get('cid');

  // Construct the new query string with only 'cid'
  const newQueryParams = new URLSearchParams();
  if (cid) {
    newQueryParams.set('cid', cid);
  }

  // Construct the new URL
  const newUrl = `${window.location.pathname}?${newQueryParams.toString()}`;

  // Use router.replace to update the URL without reloading the page
  router.replace(newUrl);
};

/**
 * Submits the OAuth settings form (either creates a new OAuth app or updates an
 * existing one).
 */

const OAuthCardFormSubmitRow = ({ app }: { app: App }) => {
  const { state, dispatch, provider } = useOAuthCardContext();
  const [recentlySaved, setRecentlySavedState] = useState(false);
  const { createToast } = useToast();
  const { trackAction } = useAnalytics();
  const providerConfig = providerConfigs[provider];

  const router = useRouter();
  const searchParams = useSearchParams();
  const testConnectionFailed = searchParams?.get('test_connection_failed') === provider;

  const { data: appInfo } = useAppInfoSuspenseQuery(
    appQueryKeys.info({
      appId: app.appId,
      appType: app.appType,
    }),
  );

  const { mutateAsync: updateAppInfo } = useUpdateAppInfoMutation({
    onMutate: () => {
      trackAction(`${providerConfig.labels.provider} Signin Save Clicked`);
    },
  });

  const isGoogleAutolinkingEnabled = appInfo.featureFlags.is_google_autolinking_enabled;

  // when the response comes back from the server, set the toggle to the value from the server
  useEffect(() => {
    dispatch({ type: 'set_auto_linking', payload: Boolean(isGoogleAutolinkingEnabled) });
  }, [isGoogleAutolinkingEnabled, dispatch]);

  const areFieldsDirty =
    (state.clientID && state.app?.app_id !== state.clientID) ||
    (state.clientSecret && state.app?.app_secret !== state.clientSecret) ||
    (state.magicLoginExperience && state.app?.login_experience !== state.magicLoginExperience) ||
    (state.metadataKid && state.app?.app_metadata?.kid !== state.metadataKid) ||
    (state.metadataTeamId && state.app?.app_metadata?.team_id !== state.metadataTeamId) ||
    appInfo.featureFlags.is_google_autolinking_enabled !== state.autoLinkingEnabled;

  const saveApp = useCallback(async () => {
    dispatch({ type: 'loading', payload: true });

    // Remove the query from the URL location, resetting the current error (if one is present)
    // The error query in the path would break the save app logic
    resetQueryString(router);

    if (!app) return;

    await updateAppInfo({
      appId: app.appId,
      appType: app.appType,
      featureFlags: {
        is_google_autolinking_enabled: state.autoLinkingEnabled,
      },
    });
    try {
      if (state.app) {
        await updateOAuthApp(state.app?.oauth_app_id, {
          app_id: state.clientID,
          app_secret: state.clientSecret,
          login_experience: state.magicLoginExperience,
          app_metadata:
            provider === 'apple' ? { kid: state.metadataKid || '', team_id: state.metadataTeamId || '' } : undefined,
        });
        dispatch({
          type: 'set_app',
          payload: {
            ...state.app,
            app_id: state.clientID,
            app_secret: state.clientSecret,
            login_experience: state.magicLoginExperience,
            app_metadata:
              provider === 'apple' ? { kid: state.metadataKid || '', team_id: state.metadataTeamId || '' } : undefined,
          },
        });
      } else {
        const { oauth_app_id, oauth_redirect_id } = (
          await createOAuthApp(app.appId, {
            provider_name: provider,
            app_id: state.clientID,
            app_secret: state.clientSecret,
            login_experience: state.magicLoginExperience,
            app_metadata:
              provider === 'apple' ? { kid: state.metadataKid || '', team_id: state.metadataTeamId || '' } : undefined,
          })
        ).data;

        dispatch({
          type: 'set_app',
          payload: {
            oauth_app_id,
            oauth_redirect_id,
            provider_name: provider,
            app_id: state.clientID,
            app_secret: state.clientSecret,
            login_experience: state.magicLoginExperience,
            app_metadata: { kid: state.metadataKid || '', team_id: state.metadataTeamId || '' },
          },
        });
      }
    } catch (e: unknown) {
      createToast({
        message: (e as Error).message,
        variant: 'error',
        lifespan: 3000,
      });

      dispatch({ type: 'loading', payload: false });
      return;
    }

    trackAction(`${providerConfig.labels.provider} Signin Saved Successfully`);

    createToast({
      message: 'Saved!',
      variant: 'success',
      lifespan: 3000,
    });
    dispatch({ type: 'loading', payload: false });
    setRecentlySavedState(true);
  }, [
    dispatch,
    router,
    app.appId,
    state.autoLinkingEnabled,
    state.app,
    state.clientID,
    state.clientSecret,
    state.metadataKid,
    state.metadataTeamId,
    state.magicLoginExperience,
    updateAppInfo,
    trackAction,
    providerConfig.labels.provider,
    createToast,
    provider,
  ]);

  const resetInputFields = useCallback(() => {
    trackAction(`${providerConfig.labels.provider} Signin Cancel Clicked`);
    dispatch({ type: 'set_client_id' });
    dispatch({ type: 'set_client_secret' });
    dispatch({ type: 'set_magic_login_experience' });
    dispatch({ type: 'set_metadata_kid' });
    dispatch({ type: 'set_metadata_team_id' });
  }, [trackAction, providerConfig.labels.provider, dispatch]);

  const testConnectionDisabled =
    !appInfo.liveApiKey || !state.clientID || !state.clientSecret || !state.magicLoginExperience;

  const testConnection = useCallback(async () => {
    if (appInfo.liveApiKey && !testConnectionDisabled) {
      trackAction(`${providerConfig.labels.provider} Signin Test Connection Clicked`);

      setRecentlySavedState(false);
      const redirectURI = new URL(
        `/app/social_login/test_connection_callback?cid=${app.appId}&provider=${provider}`,
        window.location.origin,
      ).href;

      await getOAuthMagicInstance(appInfo.liveApiKey)?.oauth2.loginWithRedirect({
        provider: provider as OAuthProvider,
        redirectURI,
      });
    }
  }, [appInfo.liveApiKey, testConnectionDisabled, trackAction, providerConfig.labels.provider, app.appId, provider]);

  return (
    <>
      <HStack justifyContent="space-between" smDown={{ flexDir: 'column' }}>
        <HStack>
          <Button
            disabled={testConnectionDisabled}
            variant="tertiary"
            onPress={testConnection}
            label="Test Connection"
          />
          {recentlySaved && <Text> 👈 Test it out </Text>}
        </HStack>

        <HStack gap={4}>
          <Button variant="tertiary" onPress={resetInputFields} disabled={!areFieldsDirty} label="Cancel" />
          <Button onPress={saveApp} disabled={!areFieldsDirty || !state.clientID || !state.clientSecret} label="Save" />
        </HStack>
      </HStack>

      {testConnectionFailed && (
        <Box mt={4}>Hmm something went wrong. Please double-check your input values and refer to our docs.</Box>
      )}
    </>
  );
};

/**
 * Renders an overall OAuth settings card for the current provider.
 */
const OAuthCard: FC<OAuthCardProps> = ({ app, provider, clients }) => {
  const ctx = {
    ...useOAuthCardReducer(),
    provider,
    clients,
  };

  useEffect(() => {
    const nextApp = clients?.find((c) => c.provider_name === provider);
    ctx.dispatch({ type: 'set_app', payload: nextApp });
    if (nextApp) ctx.dispatch({ type: 'expand' });
    if (clients) ctx.dispatch({ type: 'loading', payload: false });
  }, [clients]);

  return (
    <OAuthCardContext.Provider value={ctx}>
      <Stack gap={7}>
        <OAuthCardHeaderRow />
        <OAuthCardEnableOrDisableCTARow />

        {ctx.state.view === 'expanded' && (
          <>
            <OAuthCardAutoLinking />
            {provider !== 'google' && <OAuthCardHowToLinks />}
            {provider === 'google' && <Divider color="neutral.tertiary" />}
            <OAuthCardFormInputsRow />
            <OAuthCardFormSubmitRow app={app} />
          </>
        )}
      </Stack>
    </OAuthCardContext.Provider>
  );
};

/**
 * Renders a settings card for all available OAuth providers.
 */

export const Resolved = ({ app, provider }: { app: App; provider: providers }) => {
  const magic_client_id = app.appId;
  const [oauthClients, setOAuthClients] = useState<OAuthClientInfo[] | undefined>();

  useEffect(() => {
    getOAuthApps(magic_client_id).then((response) => {
      setOAuthClients(response?.data ?? []);
    });
  }, [magic_client_id]);

  /* DH: Desktop only. Mobile should take care of itself. */
  const getTopOffset = () => {
    const index = providerNameList.indexOf(provider);
    return `${index <= 0 ? 0 : index * 70 + 5}px`;
  };

  return (
    <HStack
      p={8}
      gap={8}
      alignItems="start"
      className={css({ '@media screen and (max-width: 1560px)': { flexDir: 'column' } })}
    >
      <Box
        pos="relative"
        maxW="320px"
        minW="240px"
        w="full"
        p="50px 30px"
        bgColor="surface.primary"
        flex="1"
        borderRadius="6px"
        className={css({ '@media screen and (max-width: 1560px)': { px: 12, py: 6, maxW: 'calc(100vw - 304px)' } })}
        mdDown={{ maxW: 'calc(100vw - 64px)' }}
      >
        <Box
          pos="absolute"
          h="calc(100% - 100px)"
          w="8px"
          bgColor="neutral.tertiary"
          borderRadius="8px"
          className={css({ '@media screen and (max-width: 1560px)': { display: 'none' } })}
        >
          <Box
            pos="absolute"
            w="8px"
            h="60px"
            bgColor="text.primary"
            borderRadius="8px"
            style={{ top: getTopOffset() }}
          />
        </Box>
        <Stack
          ml={8}
          gap={0}
          className={css({ '@media screen and (max-width: 1560px)': { flexDir: 'row', overflow: 'auto', ml: 0 } })}
        >
          {Object.entries(providerConfigs).map(([key, value]) => {
            const Logo = value.logo;
            return (
              <Link key={key} href={`/app/social_login/${key}?cid=${magic_client_id}`} shallow>
                <HStack
                  key={key}
                  opacity={provider === key ? '1' : '0.3'}
                  h={'70px'}
                  gap={4}
                  className={css({
                    '@media screen and (max-width: 1560px)': {
                      borderTopColor: provider === key ? 'text.primary ' : 'neutral.primary',
                      borderTopWidth: '6px',
                      gap: 2,
                      px: 2,
                    },
                  })}
                >
                  <Logo width={36} height={36} />
                  <Text>{value.labels.provider}</Text>
                </HStack>
              </Link>
            );
          })}
        </Stack>
      </Box>
      <Box
        bgColor="surface.primary"
        w="full"
        maxW="51rem"
        borderRadius="6px"
        p={12}
        mb={8}
        className={css({ '@media screen and (max-width: 1560px)': { w: 'calc(100vw - 304px)', maxW: 'full' } })}
        mdDown={{ w: 'calc(100vw - 64px)' }}
      >
        {Object.values(providers).map(
          (p) => provider === p && <OAuthCard app={app} provider={p} clients={oauthClients} key={`${p}-card`} />,
        )}
      </Box>
    </HStack>
  );
};

export const SocialLoginSettingsView = ({ params }: { params: { provider: providers } }) => {
  const { currentApp } = useCurrentApp();

  return currentApp && <Resolved app={currentApp} provider={params.provider} />;
};
