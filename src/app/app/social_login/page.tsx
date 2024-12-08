'use client';

import { redirect, useSearchParams } from 'next/navigation';

const Social = () => {
  const searchParams = useSearchParams();
  redirect(`/app/social_login/google?cid=${searchParams?.get('cid')}`);
};

export default Social;
