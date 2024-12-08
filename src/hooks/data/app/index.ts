import { DEFAULT_APP_LOGO_SRC, PASSPORT_APP } from '@constants/appInfo';
import { DEFAULT_RQ_SUSPENSE_CONFIG } from '@constants/react-query-conf';
import { makeAppInfoFetcher, makeAuthMethodsFetcher, makePassportAppsFetcher } from '@hooks/data/app/fetcher';
import {
  appQueryKeys,
  PassportAppsQueryKey,
  type AppInfoQueryKey,
  type AuthMethodsQueryKey,
} from '@hooks/data/app/keys';
import {
  UpdatePassportAppLogoParams,
  UploadPassportLogoParams,
  type AppInfo,
  type AppInfoParams,
  type AuthMethods,
  type CreateAppParams,
  type DismissQuickStartParams,
  type EditAppNameParams,
  type EditTermsAndPoliciesParams,
  type RollKeysParams,
  type SetSecurityOtpFlagParams,
  type UpdateAppAuthMethodParams,
  type UpdateAppAuthMethodsParams,
  type UpdateAppInfoParams,
} from '@hooks/data/app/types';
import { useDashboardStore } from '@hooks/data/store/store';
import { regenerateClientKeys } from '@hooks/data/user/fetchers';
import { userQueryKeys } from '@hooks/data/user/keys';
import { App, type UserInfo } from '@hooks/data/user/types';
import { logger } from '@libs/datadog';
import { getRelativePathFromUrl } from '@libs/get-relative-path';
import { updateAuthConfig } from '@services/auth-method-config';
import { createClient, deleteClient, editClient } from '@services/client';
import {
  createApp,
  createAppKey,
  deleteApp,
  editApp,
  LogoUploadResponse,
  regenerateAppKeys,
  uploadPassportLogo,
} from '@services/passport';
import { editQuickstartConfig } from '@services/quickstart-config';
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
  type UseMutationOptions,
  type UseSuspenseQueryOptions,
  type UseSuspenseQueryResult,
} from '@tanstack/react-query';

// QUERY HOOKS
export const useAppInfoSuspenseQuery = (
  queryKey: AppInfoQueryKey,
  config?: Omit<UseSuspenseQueryOptions<AppInfo, Error, AppInfo, AppInfoQueryKey>, 'queryKey' | 'queryFn'>,
): UseSuspenseQueryResult<AppInfo> => {
  const fetcher = makeAppInfoFetcher();
  return useSuspenseQuery({
    queryKey,
    queryFn: fetcher,
    ...DEFAULT_RQ_SUSPENSE_CONFIG,
    ...config,
  });
};

export const usePassportAppsSuspenseQuery = (
  queryKey: PassportAppsQueryKey,
  config?: Omit<UseSuspenseQueryOptions<App[], Error, App[], PassportAppsQueryKey>, 'queryKey' | 'queryFn'>,
): UseSuspenseQueryResult<App[]> => {
  return useSuspenseQuery({
    queryKey,
    queryFn: makePassportAppsFetcher(),
    ...DEFAULT_RQ_SUSPENSE_CONFIG,
    ...config,
  });
};

export const useAuthMethodsSuspenseQuery = (
  queryKey: AuthMethodsQueryKey,
  config?: Omit<UseSuspenseQueryOptions<AuthMethods, Error, AuthMethods, AuthMethodsQueryKey>, 'queryKey' | 'queryFn'>,
): UseSuspenseQueryResult<AuthMethods> => {
  const fetcher = makeAuthMethodsFetcher();
  return useSuspenseQuery({
    queryKey,
    queryFn: fetcher,
    ...DEFAULT_RQ_SUSPENSE_CONFIG,
    ...config,
  });
};

// MUTATION HOOKS
export const useCreateAppMutation = (
  config?: Omit<UseMutationOptions<AppInfoParams, Error, CreateAppParams>, 'mutationFn'>,
) => {
  const queryClient = useQueryClient();
  const { isPassportFlowEnabled } = useDashboardStore();

  return useMutation({
    mutationFn: async ({ email, appName, teamId, appType }: CreateAppParams) => {
      let response;
      if (appType === PASSPORT_APP) {
        const appResponse = await createApp(appName, teamId);
        const appKeyResponse = await createAppKey(appResponse.magic_client_id || '');
        response = { ...appResponse, ...appKeyResponse };
        await queryClient.invalidateQueries({
          queryKey: appQueryKeys.passportApps(isPassportFlowEnabled),
        });
      } else {
        response = await createClient(email, appName, teamId, appType);
        await queryClient.invalidateQueries({
          queryKey: userQueryKeys.info(),
        });
      }

      return { appId: response.magic_client_id ?? '', appType };
    },
    ...config,
  });
};

export const useDeleteAppMutation = (config?: Omit<UseMutationOptions<void, Error, AppInfoParams>, 'mutationFn'>) => {
  const queryClient = useQueryClient();
  const { isPassportFlowEnabled } = useDashboardStore();

  return useMutation({
    mutationFn: async ({ appId, appType }: AppInfoParams) => {
      if (appType === PASSPORT_APP) {
        await deleteApp(appId);
        queryClient.setQueryData(appQueryKeys.passportApps(isPassportFlowEnabled), (prev: App[]) =>
          prev.filter((v) => v.appId !== appId),
        );
      } else {
        await deleteClient(appId);
        queryClient.setQueryData(userQueryKeys.info(), (prev: UserInfo) => ({
          ...prev,
          apps: prev.apps.filter((v) => v.appId !== appId),
        }));
      }

      queryClient.removeQueries({
        queryKey: appQueryKeys.info({ appId, appType }),
      });
    },
    ...config,
  });
};

export const useUpdateAppAuthMethodMutation = (
  config?: Omit<UseMutationOptions<void, Error, UpdateAppAuthMethodParams>, 'mutationFn'>,
) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, UpdateAppAuthMethodParams>({
    mutationFn: async ({ appId, appType, name, isActive }: UpdateAppAuthMethodParams) => {
      const authMethods: AuthMethods =
        queryClient.getQueryData<AuthMethods>(appQueryKeys.authMethods({ appId, appType })) ?? [];

      const nextAuthMethods = [
        ...authMethods.filter((v) => v.name !== name),
        {
          name,
          is_active: isActive,
        },
      ];

      const { error } = await updateAuthConfig(appId, {
        auth_methods: nextAuthMethods,
      });
      if (error) {
        logger.error('Auth config update failed', {}, error as Error);
        return;
      }

      // optimistic updates
      queryClient.setQueryData(appQueryKeys.authMethods({ appId, appType }), nextAuthMethods);
    },
    ...config,
  });
};

export const useUpdateAppAuthMethodsMutation = (
  config?: Omit<UseMutationOptions<void, Error, UpdateAppAuthMethodsParams>, 'mutationFn'>,
) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, UpdateAppAuthMethodsParams>({
    mutationFn: async ({ appId, appType, authMethods }: UpdateAppAuthMethodsParams) => {
      const { error } = await updateAuthConfig(appId, {
        auth_methods: authMethods,
      });
      if (error) {
        logger.error('Auth config update failed', {}, error as Error);
        return;
      }

      // optimistic updates
      queryClient.setQueryData(appQueryKeys.authMethods({ appId, appType }), authMethods);
    },
    ...config,
  });
};

export const useRollKeysMutation = (config?: Omit<UseMutationOptions<void, Error, RollKeysParams>, 'mutationFn'>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ appId = '', appType, appKeyId = '' }: RollKeysParams) => {
      const response = appType === PASSPORT_APP ? await regenerateAppKeys(appKeyId) : await regenerateClientKeys(appId);

      // optimistic updates
      queryClient.setQueryData(appQueryKeys.info({ appId, appType }), (prev: AppInfo) => ({
        ...prev,
        liveApiKeyId: response.app_key_id,
        liveApiKey: response.live_api_key,
        liveSecretKey: response.live_secret_key,
        keysCreatedAt: new Date(),
      }));
    },
    ...config,
  });
};

export const useEditAppNameMutation = (
  config?: Omit<UseMutationOptions<void, Error, EditAppNameParams>, 'mutationFn'>,
) => {
  const queryClient = useQueryClient();
  const { isPassportFlowEnabled } = useDashboardStore();

  return useMutation({
    mutationFn: async ({ appId, appType, name }: EditAppNameParams) => {
      if (appType === PASSPORT_APP) {
        await editApp(appId, { name });
        queryClient.setQueryData(appQueryKeys.passportApps(isPassportFlowEnabled), (prev: App[]) =>
          prev.map((v) => (v.appId === appId ? { ...v, appName: name } : v)),
        );
      } else {
        await editClient({
          magic_client_id: appId,
          app_name: name,
        });
        queryClient.setQueryData(userQueryKeys.info(), (prev: UserInfo) => ({
          ...prev,
          apps: prev.apps.map((v) => (v.appId === appId ? { ...v, appName: name } : v)),
        }));
      }

      queryClient.setQueryData(appQueryKeys.info({ appId, appType }), (prev: AppInfo) => ({
        ...prev,
        appName: name,
      }));
    },
    ...config,
  });
};

export const useEditTermsAndPoliciesMutation = (
  config?: Omit<UseMutationOptions<void, Error, EditTermsAndPoliciesParams>, 'mutationFn'>,
) => {
  const queryClient = useQueryClient();
  const { isPassportFlowEnabled } = useDashboardStore();

  return useMutation({
    mutationFn: async ({ appId, termsOfService, privacyPolicy }: EditTermsAndPoliciesParams) => {
      await editApp(appId, {
        terms_of_service_uri: termsOfService,
        privacy_policy_uri: privacyPolicy,
      });

      // optimistic updates
      queryClient.setQueryData(appQueryKeys.passportApps(isPassportFlowEnabled), (prev: App[]) =>
        prev.map((v) =>
          v.appId === appId ? { ...v, appTermsOfServiceUri: termsOfService, appPrivacyPolicyUri: privacyPolicy } : v,
        ),
      );
    },
    ...config,
  });
};

export const useUploadPassportAppLogoMutation = (
  config?: Omit<UseMutationOptions<LogoUploadResponse, Error, UploadPassportLogoParams>, 'mutationFn'>,
) => {
  return useMutation({
    mutationFn: async ({ appId, formData }) => {
      const response = await uploadPassportLogo(appId, formData);
      return response;
    },
    ...config,
  });
};

export const useUpdatePassportAppLogoMutation = (
  config?: Omit<UseMutationOptions<void, Error, UpdatePassportAppLogoParams>, 'mutationFn'>,
) => {
  const queryClient = useQueryClient();
  const { isPassportFlowEnabled } = useDashboardStore();

  return useMutation({
    mutationFn: async ({ appId, appLogoUrl }) => {
      await editApp(appId, {
        logo_path: appLogoUrl ? getRelativePathFromUrl(appLogoUrl) : null,
      });

      // optimistic updates
      queryClient.setQueryData(appQueryKeys.passportApps(isPassportFlowEnabled), (prev: App[]) =>
        prev.map((v) => (v.appId === appId ? { ...v, appLogoUrl: appLogoUrl ?? DEFAULT_APP_LOGO_SRC } : v)),
      );
    },
    ...config,
  });
};

export const useDismissQuickStartMutation = (
  config?: Omit<UseMutationOptions<void, Error, DismissQuickStartParams>, 'mutationFn'>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ appId, appType }: DismissQuickStartParams) => {
      await editQuickstartConfig(appId, {
        is_quickstart_complete: true,
      });

      // optimistic updates
      queryClient.setQueryData(
        appQueryKeys.info({
          appId,
          appType,
        }),
        (prev: AppInfo) => ({
          ...prev,
          checklistFlags: {
            is_quickstart_complete: true,
          },
        }),
      );
    },
    ...config,
  });
};

export const useSetSecurityOtpFlagMutation = (
  config?: Omit<UseMutationOptions<void, Error, SetSecurityOtpFlagParams>, 'mutationFn'>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: SetSecurityOtpFlagParams) => {
      await editClient({
        magic_client_id: params.appId,
        is_security_otp_enabled: params.enabled,
      });

      // optimistic updates
      queryClient.setQueryData(
        appQueryKeys.info({
          appId: params.appId,
          appType: params.appType,
        }),
        (prev: AppInfo) => ({
          ...prev,
          etcFlags: {
            ...prev?.etcFlags,
            is_security_otp_enabled: params.enabled,
          },
        }),
      );
    },
    ...config,
  });
};

export const useUpdateAppInfoMutation = (
  config?: Omit<UseMutationOptions<void, Error, UpdateAppInfoParams>, 'mutationFn'>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: UpdateAppInfoParams) => {
      const appInfo = queryClient.getQueryData<AppInfo>(
        appQueryKeys.info({ appId: params.appId, appType: params.appType }),
      );
      if (!appInfo) {
        throw new Error('App info not found.');
      }

      await editClient({
        magic_client_id: params.appId,
        app_name: params.appName ?? appInfo.appName,
        features: {
          ...appInfo.featureFlags,
          ...params.featureFlags,
        },
        checklist_status: {
          ...appInfo.checklistFlags,
          ...params.checklistFlags,
        },
        is_security_otp_enabled: params.etcFlags?.is_security_otp_enabled ?? appInfo.etcFlags.is_security_otp_enabled,
      });

      // optimistic updates
      queryClient.setQueryData(
        appQueryKeys.info({
          appId: params.appId,
          appType: params.appType,
        }),
        (prev: AppInfo) => ({
          ...prev,
          appName: params.appName ?? prev.appName,
          featureFlags: {
            ...prev.featureFlags,
            ...params.featureFlags,
          },
          checklistFlags: {
            ...prev.checklistFlags,
            ...params.checklistFlags,
          },
          etcFlags: {
            ...prev.etcFlags,
            is_security_otp_enabled: prev.etcFlags.is_security_otp_enabled,
          },
        }),
      );
    },
    ...config,
  });
};
