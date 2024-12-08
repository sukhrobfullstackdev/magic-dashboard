export const ANALYTICS_ACTION_NAMES = {
  // pricing
  CLICK_FREE_PLAN: 'Select Developer plan',
  CLICK_FREE_PLAN_TO_DOWNGRADE: 'Select Developer plan to downgrade',
  CLICK_STARTUP_PLAN_TO_UPGRADE: 'Select Startup plan to upgrade',
  CLICK_STARTUP_PLAN_TO_DOWNGRADE: 'Select Startup plan to downgrade',
  CLICK_GROWTH_PLAN_TO_UPGRADE: 'Select Growth plan to upgrade',
  CLICK_GROWTH_PLAN_TO_DOWNGRADE: 'Select Growth plan to downgrade',
  CLICK_DOWNGRADE_TO_FREE: 'Downgrade to Developer plan',
  SUCCESSFUL_DOWNGRADE_TO_FREE: 'Successful downgrade to Developer plan',
  FAILED_DOWNGRADE_TO_FREE: 'Failed downgrade to Developer plan',

  // checkout
  CLICK_START_WITH_FREE: 'Register payment method and start with Free plan',
  CLICK_TO_PURCHASE_START_UP_PLAN: 'Purchase Startup plan',
  SUCCESSFUL_PURCHASE_OF_START_UP_PLAN: 'Successful purchase of Startup plan',
  FAILED_PURCHASE_OF_START_UP_PLAN: 'Failed purchase of Startup plan',
  CLICK_TO_PURCHASE_GROWTH_PLAN: 'Purchase Growth plan',
  SUCCESSFUL_PURCHASE_OF_GROWTH_PLAN: 'Successful purchase of Growth plan',
  FAILED_PURCHASE_OF_GROWTH_PLAN: 'Failed purchase of Growth plan',

  // billing
  CLICK_UPGRADE: 'Click to upgrade from free plan',
  CLICK_MANAGE_PLAN: 'Click to manage plan',
  CLICK_SAVE_TO_UPDATE_PAYMENT_METHOD: 'Click to save to update payment method',

  // PAYMENT_METHODS
  PAYMENT_METHOD_ADDED: 'Payment method added',

  // ETC
  CLICK_CONTACT_SALES: 'Click to contact sales',
  CLICK_DOCS: 'Docs Opened',

  // SIGN UP
  CLICK_GET_STARTED: 'Get started clicked',
  SIGN_UP_COMPLETED: 'Sign up completed',
  SIGN_UP_FAILED: 'Sign up failed',
} as const;
