import { useConfetti } from '@components/hooks/use-confetti';
import { useLocalStorage } from '@components/hooks/use-localstorage';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@components/partials/accordion';
import { CodeBlockThemed } from '@components/partials/quickstart-embedded-wallet/code-block-themed';
import { useAddContractModal } from '@components/views/gas-relayer-view/gas-relayer-view';
import { useContracts } from '@components/views/gas-relayer-view/use-contracts';
import { useCurrentApp } from '@hooks/common/use-current-app';
import { type App } from '@hooks/data/user/types';
import {
  Button,
  Card,
  IcoAdd,
  IcoCheckmark,
  IcoCheckmarkCircleFill,
  IcoCodeSandbox,
  IcoDismiss,
  IcoExternalLink,
  IcoLightningFill,
  Text,
  useToast,
} from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { Box, HStack, Stack } from '@styled/jsx';
import { token } from '@styled/tokens';
import { IconCircle1, IconCircle2, IconCircle3 } from '@tabler/icons-react';
import { useCallback, useEffect, useState } from 'react';

const CONTRACT_CODE = `// Standard module for implementing Meta Transactions
import "@openzeppelin/contracts/metatx/ERC2771Context.sol";

contract YourNFTContract is ERC2771Context, ... {

    // Hard-code Magic's Trusted Forwarder address
    address private constant TRUSTED_FORWARDER = 0xB7B46474aAA2729e07EEC90596cdD9772b29Ecfb;

    // Initialize the contract with Magic's Trusted Forwarder address
    constructor() ERC2771Context(TRUSTED_FORWARDER) {...}

    // Will be used instead of msg.data to support Meta Transactions
    function _msgData() internal view override(Context, ERC2771Context) returns (bytes calldata) {
        return ERC2771Context._msgData();
    }
    // Will be used instead of msg.sender to support Meta Transactions
    function _msgSender() internal view override(Context, ERC2771Context) returns (address sender) {
        return ERC2771Context._msgSender();
    }
}`;

const SDK_CODE = `// Create contract instance with ethers
const nftContract = new ethers.Contract(
    nftContractAddress,
    ABI,
    provider
);

// Populate transaction with relevant data
let transaction = await nftContract.populateTransaction.transfer(tokenId, destination);

// Send gasless transaction to Magic Relayer (after user login)
const gasless_request = await magic.wallet.sendGaslessTransaction(
    address, // User's Wallet address 
    transaction,
)`;

const Resolved = ({ app }: { app: App }) => {
  const { createToast } = useToast();
  const [isDone, setIsDone] = useLocalStorage('is-gas-relayer-quickstart-done', false);
  const [openIndex, setOpenIndex] = useState(0);
  const [, setIsModalOpen] = useAddContractModal();
  const { data } = useContracts({
    appId: app.appId,
    appType: app.appType,
  });
  const showConfetti = useConfetti();

  const handleOnClick = useCallback(() => {
    setIsDone(true);
    createToast({
      message: 'Well done! Happy building!',
      variant: 'success',
      lifespan: 3000,
    });
    showConfetti();
  }, []);

  const hasContracts = data?.contracts.length && data.contracts.length > 0;

  useEffect(() => {
    if (hasContracts) {
      setOpenIndex(2);
    }
  }, [hasContracts]);

  return !isDone ? (
    <Card paddingType="none">
      <HStack bg="linear-gradient(105deg, #3728b7 -25.48%, #6851ff 40.84%, #c970ff 100.89%)" py={3} px={8}>
        <IcoLightningFill width={16} height={16} color={token('colors.surface.primary')} />
        <Text.H6 fontColor="text.quaternary">Quick Start</Text.H6>
        <Box flexGrow={1} />
        <HStack gap={6}>
          <a
            href="https://codesandbox.io/p/sandbox/magic-gas-subsidy-t9g6f5?file=%2Fsrc%2FApp.js"
            target="_blank"
            rel="noopener noreferrer"
          >
            <HStack>
              <IcoCodeSandbox width={16} height={16} color={token('colors.surface.primary')} />
              <Text size="xs" fontWeight="semibold" fontColor="text.quaternary">
                CodeSandbox
              </Text>
            </HStack>
          </a>
          <Button variant="text" size="sm" onPress={() => setIsDone(true)} aria-label="dismiss">
            <Button.LeadingIcon color={token('colors.surface.primary')}>
              <IcoDismiss />
            </Button.LeadingIcon>
          </Button>
        </HStack>
      </HStack>
      <Accordion
        type="single"
        collapsible
        value={openIndex === 0 ? 'item-1' : openIndex === 1 ? 'item-2' : 'item-3'}
        onValueChange={(value) => {
          setOpenIndex(value === 'item-1' ? 0 : value === 'item-2' ? 1 : 2);
        }}
      >
        <Stack gap={4} px={8} py={6}>
          <AccordionItem value="item-1" defaultChecked className={css({ border: 0 })}>
            <AccordionTrigger>
              <HStack py={1}>
                {openIndex <= 0 ? (
                  <IconCircle1 />
                ) : (
                  <IcoCheckmarkCircleFill width={18} height={18} color={token('colors.positive.base')} />
                )}
                <Text size="sm" fontWeight="medium">
                  Create a compatible Polygon smart contract using OpenZeppelin
                </Text>
              </HStack>
            </AccordionTrigger>
            <AccordionContent asChild>
              <Stack gap={6} ml={8} mt={3}>
                <Text size="sm" fontColor="text.tertiary">
                  Smart contract should inherit the ERC-2771 Context and use Magic&apos;s Trusted Forwarder Contract.{' '}
                  <a href="https://magic.link/docs/nfts/features/gas-subsidy#usage" rel="noreferrer" target="_blank">
                    <Button size="sm" variant="text" label="Visit docs" />
                  </a>{' '}
                  for more details.
                </Text>
                <CodeBlockThemed codeString={CONTRACT_CODE} language="solidity" showLineNumbers />
                <HStack gap={4}>
                  <a href="https://magic.link/docs/nfts/features/gas-subsidy" rel="noopener">
                    <Button variant="secondary" size="sm" label="Docs">
                      <Button.TrailingIcon>
                        <IcoExternalLink />
                      </Button.TrailingIcon>
                    </Button>
                  </a>
                  <Button size="sm" onPress={() => setOpenIndex(1)} label="Mark as complete">
                    <Button.LeadingIcon>
                      <IcoCheckmark />
                    </Button.LeadingIcon>
                  </Button>
                </HStack>
              </Stack>
            </AccordionContent>
          </AccordionItem>
          <Box borderBottomColor="surface.tertiary" borderBottomWidth="1px" />

          <AccordionItem value="item-2" className={css({ border: 0 })}>
            <AccordionTrigger>
              <HStack py={1}>
                {openIndex <= 1 ? (
                  <IconCircle2 />
                ) : (
                  <IcoCheckmarkCircleFill width={18} height={18} color={token('colors.positive.base')} />
                )}
                <Text size="sm" fontWeight="medium">
                  Register your verified smart contract with Magic
                </Text>
              </HStack>
            </AccordionTrigger>
            <AccordionContent asChild>
              <Stack gap={6} ml={8} mt={3}>
                <Text size="sm" fontColor="text.tertiary">
                  Before registering with Magic, make sure your contract has been verified. Contracts can be verified{' '}
                  <a
                    href="https://www.oklink.com/amoy/verify-contract-preliminary"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      size="sm"
                      variant="text"
                      label="via Polygonscan/ Oklink/ https://testnet-explorer.etherlink.com/"
                    />
                  </a>
                  .
                </Text>
                <Box>
                  <Button size="sm" onPress={() => setIsModalOpen(true)} label="Add contract">
                    <Button.LeadingIcon>
                      <IcoAdd />
                    </Button.LeadingIcon>
                  </Button>
                </Box>
              </Stack>
            </AccordionContent>
          </AccordionItem>

          <Box borderBottomColor="surface.tertiary" borderBottomWidth="1px" />

          <AccordionItem value="item-3" className={css({ border: 0 })}>
            <AccordionTrigger>
              <HStack py={1}>
                {openIndex <= 2 ? (
                  <IconCircle3 />
                ) : (
                  <IcoCheckmarkCircleFill width={18} height={18} color={token('colors.positive.base')} />
                )}
                <Text size="sm" fontWeight="medium">
                  Call the gasless transaction SDK method
                </Text>
              </HStack>
            </AccordionTrigger>
            <AccordionContent asChild>
              <Stack gap={6} ml={8} mt={3}>
                <Text size="sm" fontColor="text.tertiary">
                  Call{' '}
                  <Text.Mono size="sm" inline variant="info" fontWeight="normal">
                    magic.wallet.sendGaslessTransaction
                  </Text.Mono>{' '}
                  to eliminate gas fees for any transaction.{' '}
                  <a
                    href="https://magic.link/docs/nfts/features/gas-subsidy#client-side-integration"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <Button size="sm" variant="text" label="Visit Magic docs" />
                  </a>{' '}
                  for more details.
                </Text>
                <CodeBlockThemed codeString={SDK_CODE} language="javascript" showLineNumbers />
                <Box>
                  <Button size="sm" onPress={handleOnClick} label="Mark as complete">
                    <Button.LeadingIcon>
                      <IcoCheckmark />
                    </Button.LeadingIcon>
                  </Button>
                </Box>
              </Stack>
            </AccordionContent>
          </AccordionItem>
        </Stack>
      </Accordion>
    </Card>
  ) : null;
};

export const QuickStartCard = () => {
  const { currentApp } = useCurrentApp();

  return currentApp && <Resolved app={currentApp} />;
};
