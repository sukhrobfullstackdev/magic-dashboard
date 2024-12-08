'use client';

import { Box } from '@styled/jsx';
import { useSearchParams } from 'next/navigation';
import { DynamicIframe } from '../components';

export const ExternalPreview = () => {
  const searchParams = useSearchParams();
  const id = searchParams?.get('id');

  const customChannelName = `template_preview_${id}`;
  return (
    <Box h="100vh" w="100vh">
      <DynamicIframe customChannelName={customChannelName} />
    </Box>
  );
};
