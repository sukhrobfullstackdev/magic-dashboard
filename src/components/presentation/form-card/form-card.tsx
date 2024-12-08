import { Button, Card, IcoLockLocked, Text } from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { Box, HStack, Stack } from '@styled/jsx';
import { token } from '@styled/tokens';
import { useState, type ReactNode } from 'react';

type FormCardProps = {
  id?: string;
  title: ReactNode;
  isFormValid?: boolean;
  onEdit?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  customAction?: ReactNode;
  readonlyView?: ReactNode;
  editView?: ReactNode;
  condensed?: boolean;
  isReadOnlyView?: boolean;
  isLocked?: boolean;
  showSaveCancel?: boolean;
  showBottomActionSection?: boolean;
  editable?: boolean;
  bottomActionSection?: ReactNode;
};

export const FormCard = ({
  id,
  title,
  onEdit,
  onSave,
  onCancel,
  customAction,
  readonlyView,
  editView,
  condensed,
  isReadOnlyView,
  isFormValid = false,
  isLocked = false,
  showSaveCancel = true,
  bottomActionSection = <></>,
  showBottomActionSection = false,
  editable = true,
}: FormCardProps) => {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave?.();
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    onCancel?.();
  };

  const content = editable && !isReadOnlyView ? editView : readonlyView;
  const showContent = Boolean(editView || readonlyView);

  const readonlyActions = (
    <>
      {isLocked ? (
        <IcoLockLocked color={token('colors.text.tertiary')} />
      ) : (
        <Button variant="text" label="Edit" onPress={onEdit} />
      )}
    </>
  );

  const editActions = (
    <HStack gap={6}>
      <Button variant="text" label="Cancel" onPress={handleCancel} />
      <Button label="Save" onPress={handleSave} disabled={!isFormValid || isSaving} validating={isSaving} />
    </HStack>
  );

  const defaultActions = isReadOnlyView ? readonlyActions : editActions;
  const showActions = Boolean(editable || customAction);

  return (
    <Card id={id} className={css({ p: 8, maxW: '47.5rem', mdDown: { p: condensed ? '1.25rem 1.875rem' : 8 } })} expand>
      <HStack justifyContent="space-between" flexWrap={showContent ? 'wrap' : 'nowrap'}>
        <Text.H4 fontWeight="semibold">{title}</Text.H4>

        {showActions && showSaveCancel && <HStack h="2.375rem">{customAction || defaultActions}</HStack>}
      </HStack>

      {showContent && (
        <Stack gap={0} mt={6} opacity={isSaving ? 0.3 : 1}>
          {content}
        </Stack>
      )}
      {showBottomActionSection && <Box w="full">{bottomActionSection}</Box>}
    </Card>
  );
};
