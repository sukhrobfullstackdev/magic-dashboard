'use client';

import { DynamicIframe } from '@components/views/email-customization-view/components';
import { useKeyDown } from '@hooks/common/use-keydown';
import { type TemplateBinding } from '@hooks/data/email-customization/types';
import { Text } from '@magiclabs/ui-components';
import { Box, Flex } from '@styled/jsx';
import { useRouter } from 'next/navigation';
import { sanitizeAndConvertHtml } from '../utils';

interface Props {
  templateBinding: TemplateBinding;
}

export const TemplateCard = ({ templateBinding }: Props) => {
  const router = useRouter();

  const handleClickTemplate = () => {
    router.push(`/app/email_customization/${templateBinding.id}?cid=${templateBinding.appId}`);
  };

  return (
    <Flex
      role="button"
      m={3}
      bg="surface.primary"
      w="270px"
      h="270px"
      rounded={20}
      direction="column"
      cursor="pointer"
      boxShadow="0px 4px 20px 0px rgba(0, 0, 0, 0.1)"
      transition="box-shadow 0.4s"
      _hover={{ boxShadow: '0px 4px 20px 0px rgba(0, 0, 0, 0.3)' }}
      onClick={handleClickTemplate}
      onKeyDown={useKeyDown(handleClickTemplate, ['Enter'])}
      tabIndex={0}
    >
      <Box h="270px" overflow="hidden" position="relative" roundedTop={20}>
        <DynamicIframe html={sanitizeAndConvertHtml(templateBinding.messageTemplate.raw)} />
        <Box position="absolute" boxShadow="inset 0px -4px 10px rgba(0, 0, 0, 0.1)" top={0} h="270px" w="270px" />
      </Box>

      <Flex direction="column" h="112px" p={4} gap={1}>
        <Text truncate fontWeight="medium">
          {templateBinding.variation}
        </Text>
        <Text fontColor="text.tertiary">
          {templateBinding.useCase === 'login_email_otp' ? 'One-Time Password' : 'Magic Link'}
        </Text>
      </Flex>
    </Flex>
  );
};
