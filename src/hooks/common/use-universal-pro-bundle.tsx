import { PLAN_NAMES } from '@constants/pricing';
import { useTeamPlanInfoSuspenseQuery } from '@hooks/data/teams';
import { teamQueryKeys } from '@hooks/data/teams/keys';
import { useMemo } from 'react';

export type UniversalProBundle = {
  teamId: string;
  billingPrice: number;
  billingTerm: string;
  productFeatures: string;
  productGroup: string;
  productName: string;
  productOrder: number;
  productPriceKey: string;
  trialEnd: Date;
  trialStart: Date;
  currentPeriodEnd: Date;
  currentPeriodStart: Date;
};

export const useUniversalProBundle = ({ teamId }: { teamId: string }) => {
  const { data: teamPlanInfo } = useTeamPlanInfoSuspenseQuery(
    teamQueryKeys.planInfo({
      teamId,
    }),
  );

  const universalProBundle: UniversalProBundle | null = useMemo(() => {
    const subscription = teamPlanInfo.subscription_details.subscriptions.find((v) =>
      v.items.find((vv) => vv.product_name === PLAN_NAMES.LEGACY_UNIVERSAL_PRO_BUNDLE),
    );

    const item = teamPlanInfo.subscription_details.subscriptions
      .flatMap((v) => v.items)
      .find((v) => v.product_name === PLAN_NAMES.LEGACY_UNIVERSAL_PRO_BUNDLE);

    if (!subscription || !item) {
      return null;
    }

    return {
      teamId,
      billingPrice: item.billing_price,
      billingTerm: item.billing_term,
      productFeatures: item.product_features,
      productGroup: item.product_group,
      productName: item.product_name,
      productOrder: item.product_order,
      productPriceKey: item.product_price_key,
      trialEnd: new Date(teamPlanInfo.subscription_details.trial_end),
      trialStart: new Date(teamPlanInfo.subscription_details.trial_start),
      currentPeriodEnd: new Date(subscription.current_period_end),
      currentPeriodStart: new Date(subscription.current_period_start),
    };
  }, [teamId, teamPlanInfo]);

  return { universalProBundle };
};
