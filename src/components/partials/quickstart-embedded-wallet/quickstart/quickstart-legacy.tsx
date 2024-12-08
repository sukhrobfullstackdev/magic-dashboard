import { useAnalytics } from '@components/hooks/use-analytics';
import { useConfetti } from '@components/hooks/use-confetti';
import { CallToActionWithCheck } from '@components/partials/quickstart-embedded-wallet/call-to-action-with-check';
import {
  CodeBlockThemed,
  InstallCodeBlockThemed,
} from '@components/partials/quickstart-embedded-wallet/code-block-themed';
import {
  BLOCKCHAINS,
  QUICKSTART_LINKS,
  QuickstartTypes,
  getInitializeMagicAtLoginCode,
  getSendYourFirstTransactionCode,
  renderRowIcon,
} from '@components/partials/quickstart-embedded-wallet/quickstart/quickstart-config';
import { useKeyDown } from '@hooks/common/use-keydown';
import { useDismissQuickStartMutation } from '@hooks/data/app';
import { type AppInfo } from '@hooks/data/app/types';
import { logger } from '@libs/datadog';
import { Callout, IcoCaretUp, Text, useToast } from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { Box, HStack, Stack } from '@styled/jsx';
import { token } from '@styled/tokens';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useCallback, useState } from 'react';

type Props = {
  appInfo: AppInfo;
  network: string;
};

export const QuickstartLegacy = ({ appInfo, network }: Props) => {
  const { trackAction } = useAnalytics();
  const { createToast } = useToast();
  const showConfetti = useConfetti();

  const [openRows, setOpenRows] = useState([true, false, false]);
  const [completedRows, setCompletedRows] = useState([false, false, false]);

  const { mutateAsync: dismissQuickStart } = useDismissQuickStartMutation({
    onError: (error, params, context) => {
      logger.error('Failed to dismiss Quick Start', { params, context }, error);

      createToast({
        message: 'Failed to dismiss Quick Start',
        variant: 'error',
      });
    },
  });

  const handleClick = (index: number) => {
    setOpenRows((prevState) => prevState.map((state, i) => (i === index ? !state : state)));
  };

  const handleMarkAsCompleteForStep1 = useCallback(() => {
    setOpenRows([false, true, false]);
    setCompletedRows([true, false, false]);
    trackAction('Quickstart Step 1 Completed');
  }, [trackAction]);

  const handleMarkAsCompleteForStep2 = useCallback(() => {
    setOpenRows([false, false, true]);
    setCompletedRows([true, true, false]);
    trackAction('Quickstart Step 2 Completed');
  }, [trackAction]);

  const handleMarkAsCompleteForStep3 = useCallback(async () => {
    setOpenRows([false, false, false]);
    setCompletedRows([true, true, true]);

    await dismissQuickStart({
      appId: appInfo.appId,
      appType: appInfo.appType,
    });

    trackAction('CLI Quickstart Completed');
    showConfetti();
    createToast({
      message: 'Well done! Happy building!',
      variant: 'success',
    });
  }, [appInfo.appId, dismissQuickStart, showConfetti, createToast, trackAction]);

  const rows = [
    {
      icon: renderRowIcon(1, completedRows[0]),
      title: 'Install Magic SDK',
      content: (
        <Stack gap={3}>
          <Text fontColor="text.tertiary">
            {'Check out our '}
            <a
              href={BLOCKCHAINS[network]?.doc ?? QUICKSTART_LINKS.DOCUMENTATION[appInfo.appType]}
              rel="noopener noreferrer"
              target="_blank"
              className={css({ color: 'brand.base', _hover: { textDecoration: 'underline' } })}
            >
              docs
            </a>
            {' to get started.'}
          </Text>
          <InstallCodeBlockThemed />
          <CallToActionWithCheck text="Mark as complete" onPress={handleMarkAsCompleteForStep1} />
        </Stack>
      ),
    },
    {
      icon: renderRowIcon(2, completedRows[1]),
      title: 'Initialize Magic at login',
      content: (
        <Stack gap={3}>
          {BLOCKCHAINS[network]?.quickstart === QuickstartTypes.OTHER ? (
            <Callout
              icon
              onPress={() =>
                window.open(
                  BLOCKCHAINS[network]?.doc ?? QUICKSTART_LINKS.DOCS_OVERVIEW[appInfo.appType],
                  '_blank',
                  'noreferrer',
                )
              }
              label="For other blockchains and networks, please see our documentation for specific integration guides."
            />
          ) : (
            <CodeBlockThemed
              codeString={getInitializeMagicAtLoginCode(appInfo.liveApiKey, network, appInfo.appType)}
              language="javascript"
            />
          )}
          <Text fontColor="text.tertiary">
            {'After you run the code in your project, you will see your first login on the '}
            <Link
              href={`/app/users?cid=${appInfo.appId}`}
              shallow
              className={css({ color: 'brand.base', _hover: { textDecoration: 'underline' } })}
            >
              Users
            </Link>
            {' tab!'}
          </Text>
          <CallToActionWithCheck onPress={handleMarkAsCompleteForStep2} text="Mark as complete" />
        </Stack>
      ),
    },
    {
      icon: renderRowIcon(3, completedRows[2]),
      title: 'Send your first transaction',
      content: (
        <Stack gap={3}>
          <Text fontColor="text.tertiary">
            Copy the code snippet to your project to send your first transaction. Make sure your wallet has sufficient
            funds for the transaction.
          </Text>
          <CodeBlockThemed
            codeString={getSendYourFirstTransactionCode(appInfo.liveApiKey, appInfo.appType, true)}
            language="javascript"
          />
          <CallToActionWithCheck onPress={handleMarkAsCompleteForStep3} text="All set" />
        </Stack>
      ),
    },
  ];

  return (
    <Box>
      {rows.map((row, index) => {
        const shouldHandleClick = completedRows[index];

        return (
          <Box pb={index !== rows.length - 1 ? 5 : 0} key={row.title}>
            <HStack
              justifyContent="space-between"
              cursor={shouldHandleClick ? 'pointer' : 'default'}
              onClick={() => shouldHandleClick && handleClick(index)}
              // eslint-disable-next-line react-hooks/rules-of-hooks
              onKeyDown={useKeyDown(() => shouldHandleClick && handleClick(index), ['Enter'])}
              role="button"
              tabIndex={0}
            >
              <HStack gap={3}>
                <Box>{row.icon}</Box>
                <Text fontWeight="semibold">{row.title}</Text>
              </HStack>
              <motion.span animate={{ rotate: openRows[index] ? 0 : 180 }} transition={{ ease: 'linear', delay: 0 }}>
                <IcoCaretUp width={14} height={14} color={token('colors.text.secondary')} />
              </motion.span>
            </HStack>
            <AnimatePresence mode="wait">
              {openRows[index] && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  style={{ overflow: 'hidden' }}
                >
                  <Box pt={4} pl={10} pr={8}>
                    {row.content}
                  </Box>
                </motion.div>
              )}
            </AnimatePresence>
          </Box>
        );
      })}
    </Box>
  );
};
