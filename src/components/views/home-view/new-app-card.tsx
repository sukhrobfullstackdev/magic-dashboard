import { useMagicLDFlags } from '@components/contexts/launch-darkly-provider';
import CreateNewAppCard from '@components/partials/create-new-app-card/create-new-app-card';
import { type AppInfo } from '@hooks/data/app/types';

const NewAppCard = ({ appInfo }: { appInfo: AppInfo }) => {
  const { isAvailableForPassportPublicTestnet } = useMagicLDFlags();

  return isAvailableForPassportPublicTestnet ? (
    <CreateNewAppCard appType={appInfo.appType} appId={appInfo.appId} />
  ) : null;
};

export default NewAppCard;
