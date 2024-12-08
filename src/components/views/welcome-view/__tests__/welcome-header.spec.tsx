import WelcomeHeader from '@components/views/welcome-view/welcome-header';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';

const setup = () => {
  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <WelcomeHeader />
    </QueryClientProvider>,
  );
};

describe('Select app', () => {
  beforeEach(setup);

  it('renders a header', () => {
    expect(screen.getByText("Let's build your My app")).toBeInTheDocument();
  });

  it('renders a subheader', () => {
    expect(screen.getByText('You can change it later by creating a new app')).toBeInTheDocument();
  });
});
