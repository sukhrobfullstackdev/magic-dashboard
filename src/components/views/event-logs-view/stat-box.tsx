import { type EventTypeFilter } from '@components/views/event-logs-view/event-logs-view';
import { Button, Card, Text } from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { Box } from '@styled/jsx';
import { token } from '@styled/tokens';
import { type FC } from 'react';
import Skeleton from 'react-loading-skeleton';

export enum StatUnit {
  NONE = 'none',
  PERCENT = 'percent',
  SECONDS = 'seconds',
}

export interface Props {
  label: string;
  value?: number | string | null;
  defaultValue?: 0 | '--';
  unit?: StatUnit;
  isLoading?: boolean;
  typeFilter?: EventTypeFilter;
  handleClickErrorReview?: () => void;
}

export const StatBox: FC<Props> = ({
  label,
  value,
  defaultValue = '--',
  unit = StatUnit.NONE,
  isLoading = false,
  typeFilter,
  handleClickErrorReview = () => {},
}) => {
  const unitSuffix = ((): string => {
    switch (unit) {
      case StatUnit.PERCENT:
        return '%';
      case StatUnit.SECONDS:
        return 's';
      default:
        return '';
    }
  })();
  const statValue = value ? `${value}${unitSuffix}` : defaultValue + '';
  const isZero = !value;
  const valueArr: string[] = statValue.split(/(?=[.])|(?<=[.])/g);
  const isErrorStat = label === 'Errors';

  return (
    <Card
      className={css({
        pos: 'relative',
        h: '136px',
      })}
    >
      <Text>{label}</Text>
      {isLoading ? (
        <Box pos="absolute" left="50%" bottom="16px" transform="translateX(-50%)">
          <Skeleton height={32} width="calc(100% - 32px)" />
        </Box>
      ) : (
        <>
          {isErrorStat && !isZero && typeFilter !== 'errors' && (
            <Button variant="text" textStyle="negative" size="sm" onPress={handleClickErrorReview} label="Review" />
          )}
          <Box pos="absolute" right={6} bottom={8}>
            {valueArr.map((val: string, i: number) => (
              <Text
                inline
                key={'stat-value-' + val + i}
                styles={{
                  color: isZero
                    ? token('colors.text.tertiary')
                    : isErrorStat
                      ? token('colors.negative.darker')
                      : undefined,
                  fontSize: i > 0 ? '24px' : '40px',
                  fontWeight: 800,
                }}
              >
                {val}
              </Text>
            ))}
          </Box>
        </>
      )}
    </Card>
  );
};
