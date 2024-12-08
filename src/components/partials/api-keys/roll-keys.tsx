import { AppType, PASSPORT_APP } from '@constants/appInfo';
import { formatToDate } from '@libs/date';
import { Button, IcoRefresh, Text } from '@magiclabs/ui-components';
import { Divider, HStack } from '@styled/jsx';

type RollKeysProps = {
  keysCreatedAt: Date;
  setIsOpened: (value: boolean) => void;
  appType: AppType;
};

export const RollKeys = ({ keysCreatedAt, setIsOpened, appType }: RollKeysProps) => {
  const buttonLabel = appType === PASSPORT_APP ? 'Roll Secret Key' : 'Roll Keys';

  return (
    <HStack gap={5}>
      <Text size="sm" fontColor="text.tertiary">
        Keys created {formatToDate(keysCreatedAt)}
      </Text>
      <Divider height={5} orientation="vertical" color="ink.30" />
      <Button variant="text" size="sm" label={buttonLabel} onPress={() => setIsOpened(true)}>
        <Button.LeadingIcon>
          <IcoRefresh />
        </Button.LeadingIcon>
      </Button>
    </HStack>
  );
};
