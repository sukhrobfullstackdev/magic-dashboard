import { DEFAULT_APP_LOGO_SRC } from '@constants/appInfo';
import { ClientInfo } from '@interfaces/client';

export const parseClientInfoToApp = (clientInfo: ClientInfo, myTeamId: string) => ({
  appId: clientInfo.magic_client_id ?? '',
  appName: clientInfo.app_name ?? '',
  appLogoUrl: clientInfo.is_default_asset ? DEFAULT_APP_LOGO_SRC : (clientInfo.asset_uri ?? DEFAULT_APP_LOGO_SRC),
  teamId: clientInfo.team_id ?? '',
  isOwner: clientInfo.team_id === myTeamId,
  teamOwnerEmail: clientInfo.team_owner_email ?? '',
  userCount: clientInfo.user_count ?? 0,
});
