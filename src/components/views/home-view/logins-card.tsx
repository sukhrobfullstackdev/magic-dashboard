import { DedicatedLoginsCard } from '@components/partials/logins-card-dedicated/dedicated-logins-card';
import { PassportLoginsCard } from '@components/partials/logins-card-passport/passport-logins-card';
import { PASSPORT_APP } from '@constants/appInfo';
import { AppInfo } from '@hooks/data/app/types';

interface LoginsCardProps {
  appInfo: AppInfo;
}

export const LoginsCard = ({ appInfo }: LoginsCardProps) => {
  return appInfo.appType === PASSPORT_APP ? (
    <PassportLoginsCard appInfo={appInfo} />
  ) : (
    <DedicatedLoginsCard appInfo={appInfo} />
  );
};
