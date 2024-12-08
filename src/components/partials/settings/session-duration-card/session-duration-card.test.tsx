import { SessionDurationCard, minutesPerDay } from '@components/partials/settings/session-duration-card';
import { ToastProvider } from '@magiclabs/ui-components';
import * as Config from '@services/session-config';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

const mockAppId = 'client eye dee';
const customDurationDays = 22;
const customDurationMinutes = minutesPerDay * customDurationDays;

jest.mock('src/hooks/data/user', () => ({
  getUserInfo: jest.fn().mockResolvedValue({
    status: 'ok',
    message: '',
    data: {
      id: 'user id',
      email: 'test@magic.link',
      public_address: 'public address',
      magic_clients: [
        {
          magic_client_id: 'client eye dee',
          app_name: 'app name',
          asset_uri: null,
          app_type: 'app type',
          team_id: 'team id',
          team_owner_email: 'test@magic.link',
        },
      ],
      magic_teams: [
        {
          team_id: 'team id',
          team_name: 'team name',
          team_owner_email: 'test@magic.link',
          team_created_at: new Date(),
        },
      ],
    },
  }),
  useUserInfoSuspenseQuery: jest.fn().mockReturnValue({
    status: 'ok',
    message: '',
    data: {
      id: 'user id',
      email: 'test@magic.link',
      publicAddress: 'public address',
      magicClients: [
        {
          magicClientId: 'client eye dee',
          appName: 'app name',
          assetUri: null,
          appType: 'app type',
          teamId: 'team id',
          teamOwnerEmail: 'test@magic.link',
        },
      ],
      teams: [
        {
          team_id: 'team id',
          team_name: 'team name',
          team_owner_email: 'test@magic.link',
          team_created_at: new Date(),
        },
      ],
    },
  }),
  makeGetUserInfoFetch: jest.fn(),
}));

jest.mock('src/services/session-config', () => ({
  __esModule: true,
  ...jest.requireActual('src/services/session-config'),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

test('renders session duration readonly view', async () => {
  jest.spyOn(Config, 'getSessionConfiguration').mockResolvedValue({
    session_duration_m: 0,
    refresh_token_duration_m: 7 * minutesPerDay,
    is_auto_refresh_session_enabled: true,
  });
  render(
    <QueryClientProvider client={new QueryClient()}>
      <ToastProvider>
        <SessionDurationCard appId={mockAppId} isAuthPremiumEnabled={false} />
      </ToastProvider>
    </QueryClientProvider>,
  );

  await waitFor(() => expect(screen.getByText('Session Management')).toBeInTheDocument());
  await waitFor(() => expect(screen.getByText('Session length')).toBeInTheDocument());
  await waitFor(() => expect(screen.getByText('7 days')).toBeInTheDocument());
});

test('renders session duration readonly custom duration', async () => {
  jest.spyOn(Config, 'getSessionConfiguration').mockResolvedValue({
    session_duration_m: 0,
    refresh_token_duration_m: customDurationMinutes,
    is_auto_refresh_session_enabled: true,
  });
  render(
    <QueryClientProvider client={new QueryClient()}>
      <ToastProvider>
        <SessionDurationCard appId={mockAppId} isAuthPremiumEnabled={false} />
      </ToastProvider>
    </QueryClientProvider>,
  );

  await waitFor(() => expect(screen.getByText('Session Management')).toBeInTheDocument());
  await waitFor(() => expect(screen.getByText(`${customDurationDays} days`)).toBeInTheDocument());
});

test('renders session duration edit view with auto refresh enabled with default', async () => {
  jest.spyOn(Config, 'getSessionConfiguration').mockResolvedValue({
    session_duration_m: 0,
    refresh_token_duration_m: minutesPerDay * 7,
    is_auto_refresh_session_enabled: true,
  });

  const { rerender } = render(
    <QueryClientProvider client={new QueryClient()}>
      <ToastProvider>
        <SessionDurationCard appId={mockAppId} isAuthPremiumEnabled />
      </ToastProvider>
    </QueryClientProvider>,
  );
  await waitFor(() => expect(screen.getByText('Session Management')).toBeInTheDocument());

  fireEvent.click(screen.getByText('Edit'));
  rerender(
    <QueryClientProvider client={new QueryClient()}>
      <ToastProvider>
        <SessionDurationCard appId={mockAppId} isAuthPremiumEnabled={false} />
      </ToastProvider>
    </QueryClientProvider>,
  );

  await waitFor(() => expect(screen.getByText('security best practices')).toBeInTheDocument());
  await waitFor(() => expect(screen.getByText('Require users to login every')).toBeInTheDocument());
});

test('renders session duration edit view with auto refresh enabled with custom duration', async () => {
  jest.spyOn(Config, 'getSessionConfiguration').mockResolvedValue({
    session_duration_m: 0,
    refresh_token_duration_m: minutesPerDay * customDurationDays,
    is_auto_refresh_session_enabled: true,
  });

  const { rerender } = render(
    <QueryClientProvider client={new QueryClient()}>
      <ToastProvider>
        <SessionDurationCard appId={mockAppId} isAuthPremiumEnabled />
      </ToastProvider>
    </QueryClientProvider>,
  );
  await waitFor(() => expect(screen.getByText('Session Management')).toBeInTheDocument());

  fireEvent.click(screen.getByText('Edit'));
  rerender(
    <QueryClientProvider client={new QueryClient()}>
      <ToastProvider>
        <SessionDurationCard appId={mockAppId} isAuthPremiumEnabled={false} />
      </ToastProvider>
    </QueryClientProvider>,
  );

  await waitFor(() => expect(screen.getByText('Require users to login every')).toBeInTheDocument());
  const customDurationInput = screen.getByLabelText('session-length-select');
  await waitFor(() => expect(customDurationInput).toHaveTextContent('Custom'));
  await waitFor(() => expect(screen.getByDisplayValue(customDurationDays)).toBeInTheDocument());
});

test('cancel reverts session duration changes', async () => {
  jest.spyOn(Config, 'getSessionConfiguration').mockResolvedValue({
    session_duration_m: 0,
    refresh_token_duration_m: 7 * minutesPerDay,
    is_auto_refresh_session_enabled: true,
  });

  const { rerender } = render(
    <QueryClientProvider client={new QueryClient()}>
      <ToastProvider>
        <SessionDurationCard appId={mockAppId} isAuthPremiumEnabled />
      </ToastProvider>
    </QueryClientProvider>,
  );
  await waitFor(() => expect(screen.getByText('Session Management')).toBeInTheDocument());

  fireEvent.click(screen.getByText('Edit'));

  fireEvent.click(screen.getByLabelText('session-length-select'));
  fireEvent.click(screen.getByText('90 days'));
  fireEvent.click(screen.getByText('Cancel'));
  rerender(
    <QueryClientProvider client={new QueryClient()}>
      <ToastProvider>
        <SessionDurationCard appId={mockAppId} isAuthPremiumEnabled={false} />
      </ToastProvider>
    </QueryClientProvider>,
  );

  await waitFor(() => expect(screen.getByText('Session Management')).toBeInTheDocument());
  await waitFor(() => expect(screen.getByText('7 days')).toBeInTheDocument());
});

test('save calls api with updated session config', async () => {
  jest.spyOn(Config, 'getSessionConfiguration').mockResolvedValue({
    session_duration_m: 0,
    refresh_token_duration_m: 7 * minutesPerDay,
    is_auto_refresh_session_enabled: false,
  });
  const updateSessionSpy = jest.spyOn(Config, 'updateSessionConfiguration').mockImplementation();

  const { rerender } = render(
    <QueryClientProvider client={new QueryClient()}>
      <ToastProvider>
        <SessionDurationCard appId={mockAppId} isAuthPremiumEnabled />
      </ToastProvider>
    </QueryClientProvider>,
  );
  await waitFor(() => expect(screen.getByText('Session Management')).toBeInTheDocument());
  fireEvent.click(screen.getByText('Edit'));

  fireEvent.click(screen.getByLabelText('session-length-select'));
  fireEvent.click(screen.getAllByText('Custom')[0]);
  fireEvent.change(screen.getByDisplayValue('7'), {
    target: { value: customDurationDays },
  });
  await waitFor(() => expect(screen.getByText('Save').closest('button')).toBeEnabled());
  await act(async () => {
    await fireEvent.click(screen.getByText('Save'));
  });
  rerender(
    <QueryClientProvider client={new QueryClient()}>
      <ToastProvider>
        <SessionDurationCard appId={mockAppId} isAuthPremiumEnabled={false} />
      </ToastProvider>
    </QueryClientProvider>,
  );

  await waitFor(() => expect(screen.getByText('Session Management')).toBeInTheDocument());
  await waitFor(() => expect(screen.getByText(`${customDurationDays} days`)).toBeInTheDocument());
  expect(updateSessionSpy).toHaveBeenCalledWith(mockAppId, {
    is_auto_refresh_session_enabled: true,
    refresh_token_duration_m: customDurationMinutes,
  });
});

test('cannot save with session length less than 7 days or greater than 90 days', async () => {
  jest.spyOn(Config, 'getSessionConfiguration').mockResolvedValue({
    session_duration_m: 0,
    refresh_token_duration_m: 7 * minutesPerDay,
    is_auto_refresh_session_enabled: true,
  });

  render(
    <QueryClientProvider client={new QueryClient()}>
      <ToastProvider>
        <SessionDurationCard appId={mockAppId} isAuthPremiumEnabled />
      </ToastProvider>
    </QueryClientProvider>,
  );
  await waitFor(() => expect(screen.getByText('Session Management')).toBeInTheDocument());
  fireEvent.click(screen.getByText('Edit'));
  fireEvent.click(screen.getByLabelText('session-length-select'));
  fireEvent.click(screen.getAllByText('Custom')[0]);
  fireEvent.change(screen.getByDisplayValue('7'), {
    target: { value: 1 },
  });
  expect(screen.getByText('Save').closest('button')).toBeDisabled();
  fireEvent.change(screen.getByDisplayValue('1'), {
    target: { value: 8 },
  });
  expect(screen.getByText('Save').closest('button')).toBeEnabled();
  fireEvent.change(screen.getByDisplayValue('8'), {
    target: { value: 91 },
  });
  expect(screen.getByText('Save').closest('button')).toBeDisabled();
  fireEvent.change(screen.getByDisplayValue('91'), {
    target: { value: 90 },
  });
  expect(screen.getByText('Save').closest('button')).toBeEnabled();
});
