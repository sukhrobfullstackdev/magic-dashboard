import { FormCard } from '@components/presentation/form-card';
import { UploadLogo } from '@components/views/customization-view/components/upload-logo';
import { useAppInfoSuspenseQuery, useUpdatePassportAppLogoMutation } from '@hooks/data/app';
import { appQueryKeys } from '@hooks/data/app/keys';
import { App } from '@hooks/data/user/types';
import { LogoFile } from '@interfaces/client';
import { useToast } from '@magiclabs/ui-components';
import { center } from '@styled/patterns';
import { useEffect, useState } from 'react';

type LogoCardProps = {
  app: App;
};

export const LogoCard = ({ app }: LogoCardProps) => {
  const [logoFile, setLogoFile] = useState<LogoFile>({});
  const [isReadOnlyView, setIsReadOnlyView] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  const { createToast } = useToast();

  const { data: appInfo } = useAppInfoSuspenseQuery(appQueryKeys.info({ appId: app.appId, appType: app.appType }));

  // TODO: Update makeAppInfoFetcher to return camel case: https://magiclink.atlassian.net/browse/M2PC-155

  const { asset_uri, is_default_asset } = appInfo.themeInfo;

  useEffect(() => {
    setLogoFile({ asset_uri, is_default_asset });
  }, [asset_uri, is_default_asset]);

  const { mutateAsync: updateAppLogo } = useUpdatePassportAppLogoMutation({
    onSuccess: () => {
      createToast({
        message: 'Logo saved!',
        variant: 'success',
      });
    },
    onError: () => {
      createToast({
        message: 'Failed to save',
        variant: 'error',
      });
    },
  });

  const handleSave = async () => {
    const logoToUpload = !logoFile.asset_uri || logoFile.is_default_asset ? null : logoFile.asset_uri;

    await updateAppLogo({ appId: app.appId, appLogoUrl: logoToUpload });

    setIsReadOnlyView(true);
    setIsDirty(false);
  };

  const handleCancel = () => {
    setLogoFile({ asset_uri, is_default_asset });
    setIsReadOnlyView(true);
    setIsDirty(false);
  };

  return (
    <FormCard
      id="card-edit-logo"
      title="Logo"
      onEdit={() => setIsReadOnlyView(false)}
      onCancel={handleCancel}
      onSave={handleSave}
      isReadOnlyView={isReadOnlyView}
      isFormValid={isDirty}
      readonlyView={
        <img
          src={logoFile.asset_uri}
          alt="App logo"
          className={center({ w: '3.5rem', h: '3.5rem', rounded: 'lg', objectFit: 'contain' })}
        />
      }
      editView={<UploadLogo appId={app.appId} logoFile={logoFile} setLogoFile={setLogoFile} setIsDirty={setIsDirty} />}
    />
  );
};
