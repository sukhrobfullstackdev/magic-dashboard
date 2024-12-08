import AppImage from '@components/views/welcome-view/app-image';
import { AppType, EMBEDDED_APP, PASSPORT_APP } from '@constants/appInfo';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';

const setup = (appType: AppType) => {
  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <AppImage appType={appType} />
    </QueryClientProvider>,
  );
};

describe('Welcome App Image', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the passport image when passport app is selected', () => {
    setup(PASSPORT_APP);
    expect(screen.getByAltText('passport-image')).toBeInTheDocument();
    expect(screen.queryByAltText('embedded-wallet-image')).not.toBeInTheDocument();
  });

  it('should render the dedicated image when dedicated app is selected', () => {
    setup(EMBEDDED_APP);
    expect(screen.getByAltText('embedded-wallet-image')).toBeInTheDocument();
    expect(screen.queryByAltText('passport-image')).not.toBeInTheDocument();
  });
});
