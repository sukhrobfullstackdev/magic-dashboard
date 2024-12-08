import { CodeTextAnimation } from '@components/partials/quickstart-passport/code-block/code-text-animation';
import { clipboard } from '@libs/copy';
import { Button } from '@magiclabs/ui-components';
import { Box, HStack } from '@styled/jsx';
import { useCallback, useState } from 'react';

interface PassportCodeBlockProps {
  codeBlockText: string;
}

export const PassportCodeBlock = ({ codeBlockText }: PassportCodeBlockProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    if (copied) return;
    clipboard.writeText(codeBlockText);
    setCopied(true);
    const timeoutId = setTimeout(() => {
      setCopied(false);
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [codeBlockText]);

  return (
    <Box
      position="relative"
      w="full"
      pb={2}
      _before={{
        content: '""',
        position: 'absolute',
        top: 1,
        width: 'full',
        height: '90%',
        opacity: 0.4,
        bg: 'linear-gradient(90deg, #FC53E1 0%, #1A1A22 37%, #1860D2 71%, #D836F2 100%)',
        filter: 'blur(20px)',
        transition: 'opacity 0.5s',
      }}
      _hover={{
        _before: {
          opacity: 0.75,
        },
      }}
    >
      <HStack
        position="relative"
        w="full"
        px={10}
        py={5}
        bg="ink.90"
        rounded="2xl"
        justifyContent="space-between"
        boxShadow="0px 8.984px 53.902px 0px rgba(104, 81, 255, 0.25), 0px 4.492px 17.967px 0px rgba(57, 57, 57, 0.10)"
        smDown={{ flexDirection: 'column', gap: 6, px: 5 }}
      >
        <CodeTextAnimation text={codeBlockText} />
        <Box data-color-mode="dark" w="98px">
          <Button expand size="sm" variant="inverse" label={copied ? 'Copied' : 'Copy'} onPress={handleCopy} />
        </Box>
      </HStack>
    </Box>
  );
};
