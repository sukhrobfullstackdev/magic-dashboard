import { FeatureRow } from '@components/partials/plan-tier-cards/feature-row/feature-row';
import { Text } from '@magiclabs/ui-components';
import { Stack } from '@styled/jsx';

type FeatureItem = {
  description: string | React.ReactNode;
  tooltip?: string | React.ReactNode;
};

type Props = {
  title?: string;
  features: FeatureItem[];
  gap?: 'sm' | 'lg';
};

export const FeatureList = ({ title, features, gap = 'sm' }: Props) => {
  return (
    <Stack gap={gap === 'lg' ? 4 : 2}>
      {title && <Text.H6 fontColor="text.primary">{title}</Text.H6>}
      {features.map((v) => {
        return <FeatureRow key={(v.description as string).replace(/[_\W]+/g, '')} {...v} />;
      })}
    </Stack>
  );
};
