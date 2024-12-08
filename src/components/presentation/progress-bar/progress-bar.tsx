import { Box } from '@styled/jsx';
import { token } from '@styled/tokens';
import { useMemo } from 'react';

const WARNING_THRESHOLD = 75;
const ERROR_THRESHOLD = 90;

type ProgressBarProps = {
  current: number;
  total: number;
};

export const ProgressBar = ({ current, total }: ProgressBarProps) => {
  const percentage = useMemo(() => {
    return (current / total) * 100;
  }, [current, total]);

  const fillColor = useMemo(() => {
    if (percentage > ERROR_THRESHOLD) {
      return token('colors.negative.lighter');
    } else if (percentage > WARNING_THRESHOLD) {
      return token('colors.warning.lighter');
    }
    return token('colors.brand.lighter');
  }, [percentage]);

  return (
    <Box bgColor="surface.tertiary" borderRadius="32px" h="8px" position="relative" w="100%">
      <Box
        position="absolute"
        h="8px"
        borderRadius="32px"
        border="2px solid"
        borderColor="surface.primary"
        minWidth="8px"
        style={{
          width: `${percentage}%`,
          background: fillColor,
        }}
      />
    </Box>
  );
};
