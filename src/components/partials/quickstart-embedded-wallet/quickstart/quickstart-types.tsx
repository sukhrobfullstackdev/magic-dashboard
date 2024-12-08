import { type AppType } from '@constants/appInfo';

export interface QuickStartProps {
  setIsQuickstartComplete: () => void;
  setShowSuccess: () => void;
  liveApiKey: string;
  appType: AppType;
  clientID: string;
  email: string;
}
