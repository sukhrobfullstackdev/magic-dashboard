import SelectApp from '@components/views/welcome-view/select-app';
import { AppType, EMBEDDED_APP, PASSPORT_APP } from '@constants/appInfo';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';

const mockSetValue = jest.fn();

const setup = (appType: AppType) => {
  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <SelectApp selectedAppType={appType} setValue={mockSetValue} />
    </QueryClientProvider>,
  );
};

describe('Select app', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('sets selected app to dedicated wallet when clicked', () => {
    setup(PASSPORT_APP);
    const dedicatedCard = screen.getByRole('button', { name: /Dedicated Wallet/i });
    fireEvent.click(dedicatedCard);
    expect(mockSetValue).toHaveBeenCalledWith('appType', EMBEDDED_APP);
  });

  it('sets selected app to passport when clicked', () => {
    setup(EMBEDDED_APP);
    const passportCard = screen.getByRole('button', { name: /Passport/i });
    fireEvent.click(passportCard);
    expect(mockSetValue).toHaveBeenCalledWith('appType', PASSPORT_APP);
  });
});
