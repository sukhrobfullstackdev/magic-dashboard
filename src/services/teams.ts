import { Get, Post, type FortmaticAPIResponse } from '@services/http/magic-rest';

interface ProductSubscriptionDetails {
  is_enabled: boolean;
  trial_start: number | null;
  trial_end: number | null;
  current_period_start: number | null;
  current_period_end: number | null;
}

export interface SubscriptionDetails {
  auth: ProductSubscriptionDetails;
  connect: ProductSubscriptionDetails;
  vip: ProductSubscriptionDetails;
  team_seats: number;
  feature_flags: string[];
  has_past_trial: boolean;
  rate_limit: number;
  subscriptions: Subscription[];
  trial_end: string;
  trial_start: string;
}

export interface GetTeamPlanInfo {
  current_plan: 'MAU' | 'Legacy Metered' | 'Enterprise';
  current_month: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  service_status: 'OK' | 'PAYMENT_OVERDUE' | 'SUSPENDED';
  status_details: { next_attempt_date: string; final_attempt_date: string }; // for 'PAYMENT_OVERDUE'
  sms_used: number;
  mau_used: number;
  is_cc_attached: boolean;
  subscription_details: SubscriptionDetailsV2;
}

export interface SubscriptionDetailsV2 {
  feature_flags: string[];
  has_past_trial: boolean;
  rate_limit: number;
  subscriptions: Subscription[];
  team_seats: number;
  trial_end: string;
  trial_start: string;
}

export interface Subscription {
  cancel_at_period_end: boolean;
  created_at: number;
  current_period_end: number;
  current_period_start: number;
  id: string;
  is_trial: boolean;
  items: Item[];
  status: string;
}

export interface Item {
  billing_price: number;
  billing_term: string;
  product_features: string;
  product_group: string;
  product_name: string;
  product_order: number;
  product_price_key: string;
}

interface GetTeamPlanInfoResponse extends FortmaticAPIResponse<GetTeamPlanInfo> {}

interface GetSubscriptionQuote {
  is_trial_available: boolean;
  trial_end: number;
  product_name: string;
  billing_term: string;
  billing_price: number;
  prorated_quote: number;
  current_period_end: number;
  quote_id: string;
  quote_expires_at: number;
}

export interface ProductFeatures {
  feature_flags: string[];
  mau_tiers: MauTier[];
  team_seats: number;
  rate_limits: number;
}

export interface MauTier {
  from: number;
  cost: number;
}

interface GetSubscriptionQuoteResponse extends FortmaticAPIResponse<GetSubscriptionQuote> {}

interface UpdateTeamPlan extends SubscriptionDetailsV2 {}

interface UpdateTeamPlanRequest {
  magic_team_id: string;
  quote_id: string;
  product_price_key: string;
  downgrade_reason?: string;
}

interface UpdateTeamPlanResponse extends FortmaticAPIResponse<UpdateTeamPlan> {}

export async function editTeamName(team_id: string, team_name: string) {
  const endpoint = 'v1/dashboard/magic_team/update_name';
  const body = { team_id, team_name };
  return (await Post(endpoint, body)).data;
}

export async function removeTeamMember(team_id: string, email: string) {
  const endpoint = 'v1/dashboard/magic_team/remove_member';
  const body = { team_id, email };
  return (await Post(endpoint, body)).data;
}

export async function getTeamInfo(team_id: string) {
  const endpoint = `v1/dashboard/magic_team/info?team_id=${team_id}`;
  return (await Get<TeamInfoResponse>(endpoint)).data;
}

export async function sendTeamInvite(team_id: string, email: string) {
  const endpoint = 'v1/dashboard/magic_team/invite/send';
  const body = { team_id, email };
  return (await Post(endpoint, body)).data;
}

export async function acceptTeamInvite(team_id: string, email: string) {
  const endpoint = 'v1/dashboard/magic_team/invite/accept';
  const body = { team_id, email };
  return (await Post(endpoint, body)).data;
}

export async function getTeamPlanInfo(team_id: string) {
  const endpoint = `/v1/dashboard/magic_team/billing_info?magic_team_id=${team_id}`;
  return (await Get<GetTeamPlanInfoResponse>(endpoint)).data;
}

export async function getSubscriptionQuote(productPriceKey: string, magicTeamId: string) {
  const endpoint = `/v1/dashboard/magic_team/subscription/quote?product_price_key=${productPriceKey}&magic_team_id=${magicTeamId}`;
  return (await Get<GetSubscriptionQuoteResponse>(endpoint)).data;
}

export async function updateTeamPlan(
  magic_team_id: string,
  quote_id: string,
  product_price_key: string,
  downgrade_reason?: string,
) {
  const endpoint = '/v1/dashboard/magic_team/subscription';
  const body = {
    magic_team_id,
    team_id: magic_team_id,
    quote_id,
    product_price_key,
    ...(downgrade_reason ? { cancel_at_period_end: true, downgrade_reason } : { proration_behavior: 'always_invoice' }),
  };
  return (await Post<UpdateTeamPlanRequest, UpdateTeamPlanResponse>(endpoint, body)).data;
}

export async function getSubscriptionPricing() {
  const endpoint = '/v1/dashboard/magic_team/subscription/pricing';
  return (await Get<GetSubscriptionPricingResponse>(endpoint)).data;
}

interface TeamInfoResponse {
  data: TeamInfo;
  error_code: string;
  message: string;
  status: string;
}

export interface TeamInfo {
  team_id: string;
  team_members: TeamMember[];
  team_name?: string;
  team_owner_email: string;
  team_created_at: string;
}

export interface TeamMember {
  email: string;
  role?: string;
  status: 'pending' | 'success';
}

export type Pricing = {
  prices: {
    billing_price: number;
    billing_term: string;
    product_price_key: string;
  }[];
  product_group: string;
  product_name: string;
  product_order: number;
}[];

interface GetSubscriptionPricingResponse extends FortmaticAPIResponse<Pricing> {}
