import {
  DeviceRegEventStatus,
  EventGroupType,
  LoginEventStatus,
  type EventGroupConfig,
  type EventStatusConfig,
} from '@custom-types/data-models/events-logs';

export const eventGroupConfig: { [key: string]: EventGroupConfig } = {
  [EventGroupType.LOGIN]: {
    statusOrder: [
      LoginEventStatus.LOGIN_INITIATED,
      LoginEventStatus.EMAIL_SENT,
      LoginEventStatus.EMAIL_DELIVERED,
      LoginEventStatus.EMAIL_OPENED,
      LoginEventStatus.LOGIN_SUCCESS,
    ],
    statusOrderWithErrors: [
      LoginEventStatus.LOGIN_INITIATED,
      LoginEventStatus.EMAIL_SENT,
      LoginEventStatus.EMAIL_BOUNCED,
      LoginEventStatus.EMAIL_DELIVERED,
      LoginEventStatus.EMAIL_OPENED,
      LoginEventStatus.LOGIN_SUCCESS,
      LoginEventStatus.ERROR,
    ],
    statusOrderWithSmtp: [LoginEventStatus.LOGIN_INITIATED, LoginEventStatus.LOGIN_SUCCESS],
  },
  [EventGroupType.NEW_DEVICE_REGISTRATION]: {
    statusOrder: [
      DeviceRegEventStatus.NEW_DEVICE_DETECTED,
      DeviceRegEventStatus.DEVICE_REG_EMAIL_SENT,
      DeviceRegEventStatus.DEVICE_REG_EMAIL_DELIVERED,
      DeviceRegEventStatus.DEVICE_REG_EMAIL_OPENED,
      DeviceRegEventStatus.DEVICE_REG_APPROVED,
      DeviceRegEventStatus.DEVICE_REG_REJECTED,
    ],
    statusOrderWithErrors: [
      DeviceRegEventStatus.NEW_DEVICE_DETECTED,
      DeviceRegEventStatus.DEVICE_REG_EMAIL_SENT,
      DeviceRegEventStatus.DEVICE_REG_EMAIL_BOUNCED,
      DeviceRegEventStatus.DEVICE_REG_EMAIL_DELIVERED,
      DeviceRegEventStatus.DEVICE_REG_EMAIL_OPENED,
      DeviceRegEventStatus.DEVICE_REG_APPROVED,
      DeviceRegEventStatus.DEVICE_REG_REJECTED,
      LoginEventStatus.ERROR,
    ],
    statusOrderWithSmtp: [
      DeviceRegEventStatus.NEW_DEVICE_DETECTED,
      DeviceRegEventStatus.DEVICE_REG_APPROVED,
      DeviceRegEventStatus.DEVICE_REG_REJECTED,
    ],
  },
};

export const eventStatusConfig: { [key: string]: EventStatusConfig } = {
  [LoginEventStatus.LOGIN_INITIATED]: {
    completeLabel: 'Login Initiated',
    isInitiator: true,
  },
  [LoginEventStatus.EMAIL_DELIVERED]: {
    completeLabel: 'Email Delivered',
    pendingLabel: 'Email not yet delivered',
  },
  [LoginEventStatus.EMAIL_BOUNCED]: {
    completeLabel: 'Email Bounced',
    isError: true,
  },
  [LoginEventStatus.EMAIL_SENT]: {
    completeLabel: 'Email Sent',
    pendingLabel: 'Email not yet sent',
  },
  [LoginEventStatus.EMAIL_OPENED]: {
    completeLabel: 'Email Opened',
    pendingLabel: 'Email not yet opened',
  },
  [LoginEventStatus.LOGIN_SUCCESS]: {
    completeLabel: 'Login Success',
    pendingLabel: 'Login not yet completed',
    isFinal: true,
  },
  [LoginEventStatus.ERROR]: {
    completeLabel: 'An unknown error occurred',
    isError: true,
  },
  [DeviceRegEventStatus.NEW_DEVICE_DETECTED]: {
    completeLabel: 'New device detected',
    isInitiator: true,
  },
  [DeviceRegEventStatus.DEVICE_REG_EMAIL_DELIVERED]: {
    completeLabel: 'Device registration email delivered',
    pendingLabel: 'Email not yet delivered',
  },
  [DeviceRegEventStatus.DEVICE_REG_EMAIL_BOUNCED]: {
    completeLabel: 'Device registration email bounced',
    isError: true,
  },
  [DeviceRegEventStatus.DEVICE_REG_EMAIL_SENT]: {
    completeLabel: 'Device registration email sent',
    pendingLabel: 'Email not yet sent',
  },
  [DeviceRegEventStatus.DEVICE_REG_EMAIL_OPENED]: {
    completeLabel: 'Device registration email opened',
    pendingLabel: 'Email not yet opened',
  },
  [DeviceRegEventStatus.DEVICE_REG_APPROVED]: {
    completeLabel: 'Device approved',
    pendingLabel: 'Device approval not yet completed',
    isFinal: true,
  },
  [DeviceRegEventStatus.DEVICE_REG_REJECTED]: {
    completeLabel: 'Device rejected',
    isFinal: true,
  },
};
