import { TextArea } from '@components/inputs/text-area';
import { Modal, ModalCloseButton } from '@components/presentation/modal/modal';
import { useAddContract } from '@components/views/gas-relayer-view/use-add-contract';
import { useAppInfoSuspenseQuery } from '@hooks/data/app';
import { appQueryKeys } from '@hooks/data/app/keys';
import { App } from '@hooks/data/user/types';
import { CHAINS, type NETWORK } from '@libs/blockchain';
import {
  Button,
  DropdownOption,
  DropdownSelector,
  IcoExternalLink,
  IcoQuestionCircleFill,
  Text,
  TextInput,
  Tooltip,
  useToast,
} from '@magiclabs/ui-components';
import { Box, HStack, Stack } from '@styled/jsx';
import { token } from '@styled/tokens';
import { useClickAway } from '@uidotdev/usehooks';
import { useForm } from 'react-hook-form';
import { getAddress, isAddress } from 'viem';

export const NETWORK_OPTIONS = [
  {
    label: 'Polygon (Mainnet)',
    value: 'polygon',
  },
  {
    label: 'Amoy (Polygon Testnet)',
    value: 'amoy',
  },
  {
    label: 'Ghostnet (Etherlink Testnet)',
    value: 'ghostnet',
  },
] satisfies { label: string; value: NETWORK }[];

type Props = {
  open: boolean;
  close: () => void;
  app: App;
};

export type FormData = {
  liveSecretKey: string;
  name: string;
  network: NETWORK;
  address: string;
  abi?: string;
};

export const AddContractModal = (props: Props) => {
  const { createToast } = useToast();
  const { open, close, app } = props;

  const { data: appInfo } = useAppInfoSuspenseQuery(
    appQueryKeys.info({
      appId: app.appId,
      appType: app.appType,
    }),
  );

  const ref = useClickAway<HTMLFormElement>(close);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = useForm<FormData>({
    mode: 'onBlur',
    reValidateMode: 'onChange',
    shouldUnregister: true,
    defaultValues: {
      network: NETWORK_OPTIONS[1].value,
    },
  });

  const { mutateAsync: addContract, isPending } = useAddContract();

  const isLoading = isSubmitting || isPending;

  const onSubmit = handleSubmit(async (contract) => {
    if (isLoading || !isValid) return;
    const address = getAddress(contract.address);

    const { success, error_message: errorMessage } = await addContract({
      ...contract,
      address,
      liveSecretKey: appInfo.liveSecretKey,
    });

    if (!success) {
      createToast({
        message: errorMessage,
        variant: 'error',
      });
      return;
    }

    close();
    reset();

    createToast({
      message: 'New smart contract added',
      variant: 'success',
    });
  });

  const network = watch('network');
  const address = watch('address');

  return (
    <Modal in={open}>
      <form ref={ref} onSubmit={onSubmit}>
        <ModalCloseButton handleClose={close} />
        <Text.H4>New Smart Contract</Text.H4>
        <Stack gap={6} w="full" mt={6}>
          <TextInput
            label="Name"
            placeholder="Test Contract"
            {...(register('name'), { required: 'Name is required' })}
            onChange={(value) => register('name').onChange({ target: { name: 'name', value } })}
            errorMessage={errors.name?.message}
            required
          />
          <DropdownSelector
            disabled={isSubmitting}
            label="Blockchain network"
            viewMax={10}
            onSelect={(value) => {
              setValue('network', value as NETWORK);
            }}
            size="md"
            selectedValue={network}
          >
            {NETWORK_OPTIONS.map((option) => (
              <DropdownOption key={option.label} label={option.label} value={option.value} />
            ))}
          </DropdownSelector>
          <Box>
            <TextInput
              label="Contract address"
              placeholder="0x..."
              {...register('address', {
                validate: (v) => {
                  if (!isAddress(v)) {
                    return 'Invalid address';
                  }
                  return true;
                },
              })}
              onChange={(value) => register('address').onChange({ target: { name: 'address', value } })}
              errorMessage={errors.address?.message}
              required
            />
            {isAddress(address) && (
              <a href={CHAINS[network]?.getAccountURL(address)} target="_blank" rel="noopener noreferrer">
                <HStack justifyContent="end" gap={2} mt={2}>
                  <Button variant="text" size="sm" label="View on Polygonscan">
                    <Button.TrailingIcon>
                      <IcoExternalLink />
                    </Button.TrailingIcon>
                  </Button>
                </HStack>
              </a>
            )}
          </Box>
          <Stack gap={2}>
            <HStack gap={2}>
              <Text size="sm" fontWeight="medium">
                Contract ABI
              </Text>
              <Tooltip
                content={
                  <Text inline size="sm" fontColor="text.tertiary">
                    Available in smart contract compilers like Hardhat
                  </Text>
                }
              >
                <IcoQuestionCircleFill width={16} height={16} color={token('colors.neutral.primary')} />
              </Tooltip>
            </HStack>
            <TextArea
              id="abi"
              {...register('abi', {
                validate: (v) => {
                  if (!v) return true;
                  try {
                    const abi = JSON.parse(v);
                    if (!Array.isArray(abi)) {
                      return 'Invalid ABI';
                    }
                    return true;
                  } catch (e) {
                    return 'Invalid ABI';
                  }
                },
              })}
              placeholder="Paste your contract ABI JSON here"
              errorMessage={errors.abi?.message}
              style={{ fontFamily: 'monospace', height: '175px', resize: 'none' }}
            />
          </Stack>
          <HStack gap={4} justifyContent="end">
            <Button variant="neutral" onPress={close} label="Cancel" />
            <Button
              type="submit"
              disabled={isLoading || !isValid}
              onPress={() => onSubmit()}
              label="Add Contract"
              validating={isLoading}
            />
          </HStack>
        </Stack>
      </form>
    </Modal>
  );
};
