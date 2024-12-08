export interface UserInfo {
  id?: string;
  authUserId?: string;
  clientId?: string;
  timestamp: string;
  key: string;
  provenance: string;
  isNew?: boolean;
  isMfaEnabled?: boolean;
}

export interface RawUserInfo {
  id?: string;
  client_id?: string;
  signup_ts?: number;
  login_ts?: number;
  isNew?: boolean;
  provenance: string;
  is_mfa_enabled?: boolean;
  auth_user_id?: string;
  wallet_type?: string;
  wallet_provider?: string;
}
