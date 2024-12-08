import { AllowedDomains, ApiKeys, KeysHeader, RollKeys, RollKeysModal } from '@components/partials/api-keys';
import { PASSPORT_APP } from '@constants/appInfo';
import { type AppInfo } from '@hooks/data/app/types';
import { Card } from '@magiclabs/ui-components';
import { useState } from 'react';

type ApiKeysCardProps = {
  appInfo: AppInfo;
};

export const ApiKeysCard = ({ appInfo }: ApiKeysCardProps) => {
  const [isOpened, setIsOpened] = useState(false);

  return (
    <>
      <Card stack gapType="lg">
        <KeysHeader appType={appInfo.appType} />
        <ApiKeys liveApiKey={appInfo.liveApiKey} liveSecretKey={appInfo.liveSecretKey} />
        {appInfo.appType !== PASSPORT_APP && (
          <AllowedDomains appId={appInfo.appId} isAllowlistEnforced={appInfo.etcFlags.is_allowlist_enforced} />
        )}
        <RollKeys keysCreatedAt={appInfo.keysCreatedAt} setIsOpened={setIsOpened} appType={appInfo.appType} />
      </Card>

      <RollKeysModal
        appKeyId={appInfo.liveApiKeyId}
        appId={appInfo.appId}
        appType={appInfo.appType}
        isOpened={isOpened}
        setIsOpened={setIsOpened}
      />
    </>
  );
};
