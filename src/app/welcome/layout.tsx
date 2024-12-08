import { HeaderOnlyLayout } from '@components/layout/header-only-layout/header-only-layout';
import { PropsWithChildren } from 'react';

const Layout = ({ children }: PropsWithChildren) => <HeaderOnlyLayout iconOnly>{children}</HeaderOnlyLayout>;

export default Layout;
