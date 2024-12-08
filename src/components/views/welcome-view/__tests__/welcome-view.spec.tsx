import WelcomeView from '@components/views/welcome-view/welcome-view';
import { PASSPORT_APP } from '@constants/appInfo';
import { TEST_CONFIG } from '@mocks/react-query';
import { mockNewUserInfo } from '@mocks/user-info';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { FormEvent } from 'react';
import { useForm } from 'react-hook-form';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock('@components/contexts/launch-darkly-provider', () => ({
  useMagicLDFlags: jest.fn(() => ({
    isAvailableForPassportPublicTestnet: true,
  })),
}));

jest.mock('react-hook-form', () => ({
  ...jest.requireActual('react-hook-form'),
  useForm: jest.fn(),
}));

const mockCreateApp = jest.fn();
jest.mock('@hooks/data/app', () => ({
  useCreateAppMutation: jest.fn(() => ({
    mutateAsync: mockCreateApp.mockResolvedValue({ appId: '123' }),
    isSuccess: true,
  })),
}));

jest.mock('@hooks/data/user', () => ({
  useUserInfoSuspenseQuery: jest.fn(() => ({
    data: mockNewUserInfo,
  })),
}));

const mockHandleSubmit = jest.fn((callback) => async (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  await callback({ appType: PASSPORT_APP });
});

(useForm as jest.Mock).mockImplementation(() => ({
  handleSubmit: mockHandleSubmit,
  formState: { isSubmitting: false },
  watch: () => PASSPORT_APP,
  setValue: jest.fn(),
}));

const setup = () => {
  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <WelcomeView />
    </QueryClientProvider>,
  );
};

describe('Select app', () => {
  beforeEach(setup);

  it('submits the form and navigates to the app page', async () => {
    const submitButton = screen.getByRole('button', { name: /Get Started/i });
    expect(submitButton).toBeInTheDocument();

    fireEvent.click(submitButton);

    expect(mockHandleSubmit).toHaveBeenCalled();
    await waitFor(() => {
      expect(mockCreateApp).toHaveBeenCalledWith({
        appName: 'My app',
        appType: PASSPORT_APP,
        email: 'test@email.com',
        teamId: '1234',
      });
      expect(mockPush).toHaveBeenCalledWith('/app?cid=123');
    });
  });
});
