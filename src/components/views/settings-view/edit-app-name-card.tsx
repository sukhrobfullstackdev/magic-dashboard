import { useAnalytics } from '@components/hooks/use-analytics';
import { FormCard } from '@components/presentation/form-card';
import { useEditAppNameMutation } from '@hooks/data/app';
import { type App } from '@hooks/data/user/types';
import { containsEmojis } from '@libs/contains-emojis';
import { Text, TextInput, useToast } from '@magiclabs/ui-components';
import { Box } from '@styled/jsx';
import { useCallback, useState } from 'react';

export const EditAppNameCard = ({ app }: { app: App }) => {
  const { trackAction } = useAnalytics();
  const { createToast } = useToast();

  const [appName, setAppName] = useState(app.appName || 'First App');
  const [isReadOnlyView, setIsReadOnlyView] = useState(true);
  const [appNameErrorMessage, setAppNameErrorMessage] = useState('');

  const { mutateAsync: editAppName } = useEditAppNameMutation({
    onSuccess: (_, { name }) => {
      trackAction('App Name Edited', { name: name.trim() });

      createToast({
        message: 'App name updated!',
        variant: 'success',
      });
    },
    onError: () => {
      createToast({
        message: 'Failed to update',
        variant: 'error',
      });
    },
  });

  const handleOnChange = useCallback((inputValue: string) => {
    setAppName(inputValue);
    setAppNameErrorMessage('');

    if (inputValue.trim()) {
      if (containsEmojis(inputValue)) setAppNameErrorMessage('Please only use alphanumeric characters');
    } else {
      setAppNameErrorMessage('App name cannot be empty');
    }
  }, []);

  const saveUpdatedAppName = useCallback(async () => {
    if (app.appId) {
      const trimmedNewAppName = appName.trim();
      await editAppName({
        appId: app.appId,
        appType: app.appType,
        name: trimmedNewAppName,
      });

      setAppName(trimmedNewAppName);
      setIsReadOnlyView(true);
    }
  }, [app.appId, appName, editAppName]);

  return (
    <FormCard
      id="card-edit-app-name"
      title="App Name"
      onEdit={() => setIsReadOnlyView(false)}
      onSave={saveUpdatedAppName}
      onCancel={() => {
        setIsReadOnlyView(true);
        setAppNameErrorMessage('');
        setAppName(app.appName || 'First App');
      }}
      isReadOnlyView={isReadOnlyView}
      isFormValid={Boolean(appName) && !appNameErrorMessage}
      readonlyView={<Text size="lg">{app.appName}</Text>}
      editView={
        <Box maxW="250px" zIndex={1}>
          <TextInput
            value={appName}
            errorMessage={appNameErrorMessage}
            onChange={handleOnChange}
            aria-label="app name input"
          />
        </Box>
      }
    />
  );
};
