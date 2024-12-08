import { useAnalytics } from '@components/hooks/use-analytics';

export const useEmailCustomizationTracking = () => {
  const { trackAction } = useAnalytics();

  const track = ({ action, data = {} }: { action: string; data?: object }) => {
    trackAction(action, {
      feature: 'email customization',
      data,
    });
  };

  return { track };
};
