import { useAnalytics } from '@components/hooks/use-analytics';
import { useAppAuthMethodDisableModal } from '@components/partials/app-auth-method-disable-modal/app-auth-method-disable-modal';
import { AuthMethodCard } from '@components/presentation/auth-method-card/auth-method-card';
import { APP_AUTH_METHODS_METADATA } from '@constants/app-auth-methods';
import { AppType } from '@constants/appInfo';
import { useAuthMethodsSuspenseQuery, useUpdateAppAuthMethodMutation } from '@hooks/data/app';
import { appQueryKeys } from '@hooks/data/app/keys';
import { logger } from '@libs/datadog';
import { Switch, useToast } from '@magiclabs/ui-components';
import { type AuthMethodName } from '@services/auth-method-config';
import { useMemo } from 'react';

type Props = {
  appId: string;
  appType: AppType;
  authMethodName: AuthMethodName;
};

export const WalletProviderCard = ({ appId, appType, authMethodName }: Props) => {
  const { createToast } = useToast();
  const { trackAction } = useAnalytics();
  const openDisableModal = useAppAuthMethodDisableModal((state) => state.open);

  const metadata = APP_AUTH_METHODS_METADATA[authMethodName];
  const Icon = metadata.icon;

  const { data: authMethods } = useAuthMethodsSuspenseQuery(
    appQueryKeys.authMethods({
      appId,
      appType,
    }),
  );

  const { mutateAsync: updateAppAuthMethod } = useUpdateAppAuthMethodMutation({
    onSuccess: (_, params) => {
      const message = `${metadata.label} ${params.isActive ? 'enabled' : 'disabled'}`;
      const variant = params.isActive ? 'success' : 'neutral';

      trackAction(message, { ...params });
      createToast({
        message,
        variant,
      });
    },
    onError: (error, params, context) => {
      const message = `Failed to ${params.isActive ? 'enable' : 'disable'} ${metadata.label}`;

      logger.error(message, { params, context }, error);
      createToast({
        message,
        variant: 'error',
      });
    },
  });

  const isEnabled = useMemo(() => {
    return Boolean(authMethods.find((v) => v.name === authMethodName && v.is_active));
  }, [authMethodName, authMethods]);

  const handleToggle = async () => {
    if (isEnabled) {
      openDisableModal(authMethodName, appId, appType);
    } else {
      await updateAppAuthMethod({
        appId,
        appType,
        name: authMethodName,
        isActive: !isEnabled,
      });
    }
  };

  return (
    <AuthMethodCard enabled={isEnabled}>
      <AuthMethodCard.Icon>
        <Icon width={30} height={30} />
      </AuthMethodCard.Icon>
      <AuthMethodCard.Label>{metadata.label} login</AuthMethodCard.Label>
      <AuthMethodCard.Action>
        <Switch onChange={() => handleToggle()} checked={isEnabled} />
      </AuthMethodCard.Action>
    </AuthMethodCard>
  );
};
