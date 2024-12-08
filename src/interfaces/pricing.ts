import { type PLAN_NAMES, type PLAN_TERMS } from '@constants/pricing';

export type PlanName = (typeof PLAN_NAMES)[keyof typeof PLAN_NAMES];

export type PlanTerm = (typeof PLAN_TERMS)[keyof typeof PLAN_TERMS];
