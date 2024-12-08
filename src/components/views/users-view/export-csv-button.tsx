import { Button } from '@magiclabs/ui-components';
import { useForm } from 'react-hook-form';

type Props = {
  onClick: () => Promise<string>;
};

export const ExportCsvButton = ({ onClick }: Props) => {
  const {
    handleSubmit,
    formState: { isSubmitting },
  } = useForm();

  const onSubmit = handleSubmit(async () => {
    await onClick();
  });

  return (
    <Button size="sm" label="Export CSV" onPress={() => onSubmit()} disabled={isSubmitting} validating={isSubmitting} />
  );
};
