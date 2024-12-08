import { PassportQuickstart } from '@components/partials/quickstart-passport/passport-quickstart';
import { AppInfo } from '@hooks/data/app/types';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen } from '@testing-library/react';

const mockAppInfo = {
  appId: 'test1234',
  liveApiKey: 'pk_live_1234',
};

const mockDismiss = jest.fn();

jest.mock('@hooks/data/app', () => ({
  useDismissQuickStartMutation: () => ({
    mutateAsync: mockDismiss,
  }),
}));

jest.mock('@components/hooks/use-analytics', () => ({
  useAnalytics: () => ({
    trackAction: jest.fn(),
  }),
}));

const setup = () => {
  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <PassportQuickstart appInfo={mockAppInfo as AppInfo} />
    </QueryClientProvider>,
  );
};

describe('Passport quickstart', () => {
  beforeEach(setup);

  it('should render the header text', () => {
    expect(screen.getByText('Start building onchain apps, faster.')).toBeInTheDocument();
  });

  it('should render the body text', () => {
    expect(
      screen.getByText('Get started with the CLI to onboard your users with Magic Passport in seconds.'),
    ).toBeInTheDocument();
  });

  it('dismiss button should dismiss the modal', () => {
    const dismissButton = screen.getByLabelText('dismiss');
    const quickstartHeader = screen.getByText('Start building onchain apps, faster.');
    expect(dismissButton).toBeInTheDocument();
    expect(quickstartHeader).toBeInTheDocument();
    act(() => {
      dismissButton.click();
    });
    expect(quickstartHeader).not.toBeInTheDocument();
  });
});
