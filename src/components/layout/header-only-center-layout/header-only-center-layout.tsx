import { HeaderOnlyLayout } from '@components/layout/header-only-layout/header-only-layout';
import { css } from '@styled/css';
import { VStack } from '@styled/jsx';
import { type PropsWithChildren } from 'react';

type Props = PropsWithChildren;

export const HeaderOnlyCenterLayout = ({ children }: Props) => {
  return (
    <>
      <HeaderOnlyLayout className={css({ backgroundColor: 'surface.secondary', pt: 11, px: 5, pb: 20 })} payable>
        <VStack w="full" maxW="1132px">
          {children}
        </VStack>
      </HeaderOnlyLayout>
    </>
  );
};
