import { useCurrentApp } from '@hooks/common/use-current-app';
import { Button, IcoCopy, IcoExternalLink, IcoKebab, IcoTrash, Popover } from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { Divider, VStack } from '@styled/jsx';
import { hstack } from '@styled/patterns';
import Link from 'next/link';
import { useEmailCustomizationTracking } from '../useEmailCustomizationTracking';

export const ActionsMenu = ({
  id,
  showDelete,
  onDelete,
  onDuplicate,
}: {
  id: string;
  showDelete: boolean;
  onDelete: () => void;
  onDuplicate: () => void;
}) => {
  const { currentApp } = useCurrentApp();
  const { track } = useEmailCustomizationTracking();

  return (
    <Popover variant="text" trigger="click">
      <Popover.LeadingIcon>
        <IcoKebab />
      </Popover.LeadingIcon>
      <Popover.Content>
        <VStack gap={3} alignItems="flex-start" p={1}>
          <Link
            className={hstack({
              lgDown: {
                display: 'none',
              },
            })}
            href={`/app/email_customization/preview?id=${id}`}
            target="_blank"
            rel="noreferrer"
            onClick={() => track({ action: 'actions menu: preview clicked' })}
          >
            <Button size="sm" variant="text" label="Preview">
              <Button.LeadingIcon>
                <IcoExternalLink />
              </Button.LeadingIcon>
            </Button>
          </Link>

          <Divider
            color="neutral.tertiary"
            className={css({
              lgDown: {
                display: 'none',
              },
            })}
          />

          <Link
            href={`/app/email_customization/new_template?cid=${currentApp?.appId}&is_duplicate=true`}
            target="_blank"
            rel="noreferrer"
            onClick={() => {
              track({ action: 'actions menu: duplicate clicked' });
              onDuplicate();
            }}
          >
            <Button size="sm" variant="text" label="Duplicate">
              <Button.LeadingIcon>
                <IcoCopy />
              </Button.LeadingIcon>
            </Button>
          </Link>

          {showDelete && (
            <>
              <Divider color="neutral.tertiary" />
              <Button
                variant="text"
                textStyle="negative"
                label="Delete"
                size="sm"
                onPress={() => {
                  track({ action: 'actions menu: delete clicked' });
                  onDelete();
                }}
              >
                <Button.LeadingIcon>
                  <IcoTrash />
                </Button.LeadingIcon>
              </Button>
            </>
          )}
        </VStack>
      </Popover.Content>
    </Popover>
  );
};
