import { EmbeddedWalletResources } from '@components/partials/resources-card-embedded-wallet/embedded-wallet-resources';
import PassportResources from '@components/partials/resources-card-passport/passport-resources';
import { AppType, PASSPORT_APP } from '@constants/appInfo';

interface ResourcesCardProps {
  appType: AppType;
}

export const ResourcesCard = ({ appType }: ResourcesCardProps) => {
  return appType === PASSPORT_APP ? <PassportResources /> : <EmbeddedWalletResources />;
};
