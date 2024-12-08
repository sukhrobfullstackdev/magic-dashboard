import { Card, IcoAdd, Text } from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { token } from '@styled/tokens';

interface NewAppCardProps {
  onClick: () => void;
}

const NewAppCard = ({ onClick }: NewAppCardProps) => {
  return (
    <Card id="btn-new-app" alt asButton onClick={onClick} className={css({ gap: 2 })}>
      <IcoAdd width={20} height={20} color={token('colors.text.secondary')} />
      <Text fontColor="text.secondary" fontWeight="semibold">
        New App
      </Text>
    </Card>
  );
};

export default NewAppCard;
