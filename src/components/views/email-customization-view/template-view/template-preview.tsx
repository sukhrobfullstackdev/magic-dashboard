import { IcoExternalLink, Text } from '@magiclabs/ui-components';
import { Box, Flex } from '@styled/jsx';
import { circle } from '@styled/patterns';
import Link from 'next/link';
import { DynamicIframe } from '../components';

export const TemplatePreview = ({
  html,
  subject,
  bindingId,
  senderName,
  senderEmail,
}: {
  html: string;
  subject: string;
  bindingId: string;
  senderName?: string;
  senderEmail?: string;
}) => {
  return (
    <>
      <Box px={10} py={6} borderBottomWidth="thin" borderBottomColor="neutral.secondary">
        <Text size="lg">{subject}</Text>
        <Flex mt={3} gap={1}>
          <Text size="sm" fontWeight="bold">
            {senderName || 'Login'}
          </Text>
          <Text size="sm" fontColor="text.tertiary">
            {`<${senderEmail || 'noreply@trymagic.com'}>`}
          </Text>
        </Flex>
        <Flex gap={0.5}>
          <Text size="sm" fontColor="text.tertiary">
            to me &#9662;
          </Text>
        </Flex>
      </Box>
      <Box overflow="hidden" position="relative" h="60rem">
        <DynamicIframe html={html} />
        <Link
          className={circle({
            position: 'absolute',
            w: 8,
            h: 8,
            top: 4,
            right: 4,
            bg: 'paper',
            _hover: { bg: 'neutral.tertiary' },
          })}
          href={`/app/email_customization/preview?id=${bindingId}`}
          target="_blank"
          rel="noreferrer"
        >
          <IcoExternalLink width={16} height={16} />
        </Link>
      </Box>
    </>
  );
};
