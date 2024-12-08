import {
  SessionDurationEditView,
  defaultSessionDurationOption,
  maxSessionDuration,
  minSessionDuration,
} from '@components/partials/settings/session-duration-card/session-duration-edit-view';
import { SessionDurationReadyOnlyView } from '@components/partials/settings/session-duration-card/session-duration-readonly-view';
import { FormCard } from '@components/presentation/form-card';
import { logger } from '@libs/datadog';
import { useToast } from '@magiclabs/ui-components';
import {
  getSessionConfiguration,
  updateSessionConfiguration,
  type SessionConfiguration,
} from '@services/session-config';
import { Box } from '@styled/jsx';
import { useEffect, useState, type ComponentProps } from 'react';

export const minutesPerDay = 1440;

type Props = {
  appId: string;
  isAuthPremiumEnabled: boolean;
};

function useSessionConfiguration(client_id: string | undefined) {
  const [config, setConfig] = useState<SessionConfiguration>();

  useEffect(() => {
    const getConfig = async () => {
      if (client_id === undefined) return;
      try {
        const configValue = await getSessionConfiguration(client_id);
        setConfig(configValue);
      } catch (err: unknown) {
        logger.error(
          'failed to fetch session configuration',
          {
            clientId: client_id,
          },
          err as Error,
        );
      }
    };

    getConfig();
  }, [client_id]);

  const updateConfig = async (isRefresh: boolean, lengthMinutes: number) => {
    try {
      await updateSessionConfiguration(client_id || '', {
        is_auto_refresh_session_enabled: isRefresh,
        refresh_token_duration_m: lengthMinutes,
      });
    } catch (err: unknown) {
      logger.error(
        'failed to update session configuration',
        {
          clientId: client_id,
          isAutoRefreshSessionEnabled: isRefresh,
          refreshTokenDurationM: lengthMinutes,
        },
        err as Error,
      );
    }
  };

  return {
    config,
    updateConfig,
  };
}

export const SessionDurationCard = ({ appId, isAuthPremiumEnabled }: Props) => {
  const { createToast } = useToast();
  const { config, updateConfig } = useSessionConfiguration(appId);
  const [customSessionLengthDays, setCustomSessionLengthDays] = useState(`${defaultSessionDurationOption}`);
  const [isReadOnlyView, setIsReadOnlyView] = useState(true);

  useEffect(() => {
    if (!config) {
      return;
    }
    setCustomSessionLengthDays(
      `${Math.floor(config.refresh_token_duration_m / minutesPerDay) || defaultSessionDurationOption}`,
    );
  }, [config]);

  const isSessionLengthValid =
    Number(customSessionLengthDays) <= maxSessionDuration && Number(customSessionLengthDays) >= minSessionDuration;

  const onUpdateSessionDuration = async () => {
    const length = Number(customSessionLengthDays);
    await updateConfig(true, length * minutesPerDay);
    setCustomSessionLengthDays(`${length}`);
    setIsReadOnlyView(true);

    createToast({
      message: 'Saved!',
      variant: 'success',
    });
  };

  const onCancelEdit = () => {
    setCustomSessionLengthDays(
      `${Math.floor(config!.refresh_token_duration_m / minutesPerDay) || defaultSessionDurationOption}`,
    );
    setIsReadOnlyView(true);
  };

  const editSessionFormProps: ComponentProps<typeof SessionDurationEditView> = {
    customSessionLengthDays,
    setCustomSessionLengthDays,
  };

  if (!config) return null;

  return (
    <Box id="card-session-duration">
      <FormCard
        title="Session Management"
        onEdit={() => setIsReadOnlyView(false)}
        onSave={onUpdateSessionDuration}
        onCancel={onCancelEdit}
        isReadOnlyView={isReadOnlyView}
        isFormValid={isSessionLengthValid}
        readonlyView={<SessionDurationReadyOnlyView sessionLength={Number(customSessionLengthDays)} />}
        editView={<SessionDurationEditView {...editSessionFormProps} />}
        isLocked={!isAuthPremiumEnabled}
      />
    </Box>
  );
};
