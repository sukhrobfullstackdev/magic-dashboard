import { HStack } from '@styled/jsx';
import { JetBrains_Mono } from 'next/font/google';

type Props = {
  description: string;
};

const jetBrainsMono = JetBrains_Mono({
  display: 'swap',
  subsets: ['latin'],
  weight: ['600'],
});

export const FeaturePlusRow = ({ description }: Props) => {
  return (
    <HStack gap={1}>
      <p
        style={{
          color: '#A799FF',
          fontFamily: jetBrainsMono.style.fontFamily,
          fontSize: '1.25rem',
          fontWeight: 'bold',
          lineHeight: '1.5rem',
          userSelect: 'none',
        }}
      >
        +
      </p>
      <p></p>
      <p
        style={{
          fontFamily: jetBrainsMono.style.fontFamily,
          fontSize: '0.875rem',
          fontWeight: '600',
          whiteSpace: 'nowrap',
          lineHeight: '1.5rem',
          textTransform: 'uppercase',
          background: 'linear-gradient(105deg, #3728B7 -25.48%, #6851FF 40.84%, #C970FF 100.89%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        {description}
      </p>
    </HStack>
  );
};
