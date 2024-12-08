// RETURN TYPES
export type CustomSmtpInfo = {
  senderEmail: string;
  senderName: string;
  host: string;
  port: string;
  userName: string;
  userPassword: string;
};

// PARAMS
export type CustomSmtpInfoParams = {
  appId: string;
};

export type SaveCustomSmtpParams = {
  appId: string;
  customSmtpInfo: CustomSmtpInfo;
};

export type SendTestEmailParams = {
  appId: string;
};

export type SmtpInfoParams = {
  appId: string;
};
