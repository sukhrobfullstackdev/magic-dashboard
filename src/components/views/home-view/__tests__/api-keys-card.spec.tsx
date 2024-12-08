import { ApiKeysCard } from '@components/views/home-view/api-keys-card';
import { AppInfo } from '@hooks/data/app/types';
import { clipboard } from '@libs/copy';
import { formatToDate } from '@libs/date';
import { mockDedicatedAppInfo, mockPassportAppInfo } from '@mocks/app-info';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock('@hooks/data/app', () => ({
  useRollKeysMutation: jest.fn().mockReturnValue({
    mutateAsync: jest.fn(),
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

jest.mock('@libs/copy', () => ({
  clipboard: {
    writeText: jest.fn(),
  },
}));

jest.mock('@components/hooks/use-analytics', () => ({
  useAnalytics: () => ({
    trackAction: jest.fn(),
  }),
}));

const setup = (appInfo: AppInfo) => {
  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <ApiKeysCard appInfo={appInfo} />
    </QueryClientProvider>,
  );
};

describe('API Keys Card', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the passport API key for passport apps', async () => {
    setup(mockPassportAppInfo);
    await waitFor(() => {
      expect(screen.getByText('Passport Wallet')).toBeInTheDocument();
      expect(screen.queryByText('Dedicated Wallet')).not.toBeInTheDocument();
    });
  });

  it('should render the dedicated wallet API key for dedicated apps', async () => {
    setup(mockDedicatedAppInfo);
    await waitFor(() => {
      expect(screen.getByText('Dedicated Wallet')).toBeInTheDocument();
      expect(screen.queryByText('Passport Wallet')).not.toBeInTheDocument();
    });
  });

  it('should render the API key', async () => {
    setup(mockPassportAppInfo);
    await waitFor(() => {
      expect(screen.getByText(mockPassportAppInfo.liveApiKey)).toBeInTheDocument();
    });
  });

  it('copy button should copy text', async () => {
    setup(mockPassportAppInfo);
    const [publishableKeyCopyButton, secretKeyCopyButton] = await screen.findAllByLabelText('copy');
    expect(publishableKeyCopyButton).toBeInTheDocument();
    expect(secretKeyCopyButton).toBeInTheDocument();
    act(() => publishableKeyCopyButton.click());
    await waitFor(() => {
      expect(clipboard.writeText).toHaveBeenCalledWith(mockPassportAppInfo.liveApiKey);
    });
    act(() => secretKeyCopyButton.click());
    await waitFor(() => {
      expect(clipboard.writeText).toHaveBeenCalledWith(mockPassportAppInfo.liveSecretKey);
    });
  });

  it('should render a formatted keys created date', async () => {
    setup(mockPassportAppInfo);
    const formattedDate = formatToDate(mockPassportAppInfo.keysCreatedAt);
    await waitFor(() => {
      expect(screen.getByText(`Keys created ${formattedDate}`)).toBeInTheDocument();
    });
  });

  it('should render a roll keys modal when button is clicked', async () => {
    setup(mockPassportAppInfo);
    const rollKeysButton = await screen.findByText('Roll Secret Key');
    expect(rollKeysButton).toBeInTheDocument();
  });
});
