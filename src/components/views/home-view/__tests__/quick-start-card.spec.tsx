import { QuickStartCard } from '@components/views/home-view/quick-start-card';
import { AppInfo } from '@hooks/data/app/types';
import { mockDedicatedAppInfo, mockPassportAppInfo } from '@mocks/app-info';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';

jest.mock('@hooks/data/app-users', () => ({
  useSignupAppUsersSuspenseQuery: jest.fn(),
}));

jest.mock('@components/contexts/launch-darkly-provider', () => ({
  useMagicLDFlags: jest.fn().mockReturnValue({
    isDashboardQuickStartEnabled: true,
  }),
}));

jest.mock('@hooks/data/app-users', () => ({
  useSignupAppUsersSuspenseQuery: jest.fn().mockReturnValue({
    data: {
      count: 5,
    },
  }),
}));

jest.mock('@uidotdev/usehooks', () => ({
  useDebounce: jest.fn(),
}));

const setup = (appInfo: AppInfo) => {
  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <QuickStartCard appInfo={appInfo} />
    </QueryClientProvider>,
  );
};

describe('Quickstart Card', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the passport quickstart when LD flag is true', () => {
    setup(mockPassportAppInfo);
    expect(screen.getByText('Start building onchain apps, faster.')).toBeInTheDocument();
  });

  it('should render the embedded wallet quickstart when LD flag is false', async () => {
    setup(mockDedicatedAppInfo);
    await waitFor(() => {
      expect(screen.getByText('Build a demo in minutes')).toBeInTheDocument();
    });
  });
});
