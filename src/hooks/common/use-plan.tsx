import { PLAN_NAMES, PLAN_TERMS } from '@constants/pricing';
import { useTeamPlanInfoSuspenseQuery } from '@hooks/data/teams';
import { teamQueryKeys } from '@hooks/data/teams/keys';

import { type PlanName, type PlanTerm } from '@interfaces/pricing';
import { parseToDate } from '@libs/date';
import { type GetTeamPlanInfo, type Subscription } from '@services/teams';
import { format, isBefore } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { useMemo } from 'react';

export const getPlanFromTeamPlanInfo = (teamPlanInfo: GetTeamPlanInfo) => {
  const plans = teamPlanInfo.subscription_details.subscriptions;
  const planNames = [
    PLAN_NAMES.ENTERPRISE,
    PLAN_NAMES.GROWTH,
    PLAN_NAMES.STARTUP,
    PLAN_NAMES.LEGACY_DEDICATED_PRO_BUNDLE,
    PLAN_NAMES.LEGACY,
  ];

  let subscription: Subscription | undefined;
  let planName: PlanName = PLAN_NAMES.FREE;
  let planTerm: PlanTerm = PLAN_TERMS.NO_TIME_LIMIT;
  for (const name of planNames) {
    const plan = plans.find((v) => v?.items?.some((vv) => vv.product_name === name));
    if (plan) {
      if (plan.items[0]?.product_name === PLAN_NAMES.LEGACY_DEDICATED_PRO_BUNDLE) {
        planName = PLAN_NAMES.LEGACY;
      } else {
        planName = name;
      }

      if (plan.items[0]?.billing_term.includes('month')) {
        planTerm = PLAN_TERMS.MONTHLY;
      } else if (plan.items[0]?.billing_term.includes('year')) {
        planTerm = PLAN_TERMS.YEARLY;
      }

      subscription = plan;
      break;
    }
  }

  const isStartupRenew = teamPlanInfo.subscription_details.subscriptions
    .flatMap((v) => v.items)
    .find((v) => v.product_name === PLAN_NAMES.STARTUP);
  const isGrowthRenew = teamPlanInfo.subscription_details.subscriptions
    .flatMap((v) => v.items)
    .find((v) => v.product_name === PLAN_NAMES.GROWTH);

  return {
    payment: {
      status: teamPlanInfo.service_status,
      finalAttemptData: teamPlanInfo.status_details?.final_attempt_date
        ? new Date(teamPlanInfo.status_details.final_attempt_date)
        : null,
      nextAttemptDate: teamPlanInfo.status_details?.next_attempt_date
        ? new Date(teamPlanInfo.status_details.next_attempt_date)
        : null,
    },
    planName,
    planTerm,
    currentMonth: format(new Date(2000, teamPlanInfo.current_month - 1), 'MMMM', { locale: enUS }),
    mauUsed: teamPlanInfo.mau_used ?? 300,
    smsUsed: teamPlanInfo.sms_used ?? 1000,
    rateLimit: teamPlanInfo.subscription_details.rate_limit ?? 1000,
    seatCount: teamPlanInfo.subscription_details.team_seats ?? 3,

    isCanceled: subscription?.cancel_at_period_end ?? false,
    endedAt: parseToDate(subscription?.current_period_end),

    freeTrial: {
      isEnabled:
        !teamPlanInfo.subscription_details.trial_end ||
        isBefore(new Date(), new Date(teamPlanInfo.subscription_details.trial_end)),
      startedAt: parseToDate(teamPlanInfo.subscription_details.trial_start),
      endedAt: parseToDate(teamPlanInfo.subscription_details.trial_end),
    },
    isCreditCardAttached: teamPlanInfo.is_cc_attached,
    isStartupRenew: Boolean(isStartupRenew),
    isGrowthRenew: Boolean(isGrowthRenew),

    featureFlags: teamPlanInfo.subscription_details.feature_flags,
  };
};

export const usePlan = ({ teamId }: { teamId: string }) => {
  const { data: teamPlanInfo } = useTeamPlanInfoSuspenseQuery(
    teamQueryKeys.planInfo({
      teamId,
    }),
  );

  const plan = useMemo(() => {
    return getPlanFromTeamPlanInfo(teamPlanInfo);
  }, [teamPlanInfo]);

  return { plan };
};
