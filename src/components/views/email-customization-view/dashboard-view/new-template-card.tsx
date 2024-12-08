import { useKeyDown } from '@hooks/common/use-keydown';
import { IcoAdd } from '@magiclabs/ui-components';
import { Center } from '@styled/jsx';
import { token } from '@styled/tokens';

type Props = {
  onClick: () => void;
};

export const NewTemplateCard = ({ onClick }: Props) => {
  return (
    <Center
      role="button"
      m={3}
      bg="neutral.tertiary"
      w="270px"
      h="270px"
      rounded={20}
      cursor="pointer"
      transition="background-color 0.4s"
      _hover={{ bg: 'neutral.secondary' }}
      onClick={onClick}
      tabIndex={0}
      onKeyDown={useKeyDown(onClick, ['Enter'])}
    >
      <IcoAdd height={40} width={40} color={token('colors.neutral.primary')} />
    </Center>
  );
};
