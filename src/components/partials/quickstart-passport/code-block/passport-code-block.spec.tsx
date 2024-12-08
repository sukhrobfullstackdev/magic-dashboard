import { PassportCodeBlock } from '@components/partials/quickstart-passport/code-block/passport-code-block';
import { clipboard } from '@libs/copy';
import { act, render, screen, waitFor } from '@testing-library/react';

const codeBlockText = 'npx make-magic pk_live_1234';

jest.mock('@libs/copy', () => ({
  clipboard: {
    writeText: jest.fn(),
  },
}));

const setup = () => {
  return render(<PassportCodeBlock codeBlockText={codeBlockText} />);
};

describe('Passport quickstart code block', () => {
  beforeEach(setup);

  it('should render the code block', async () => {
    await waitFor(() => expect(screen.getByText(codeBlockText)).toBeInTheDocument(), {
      timeout: 1000,
    });
  });

  it('copy button should copy text', () => {
    const copyButton = screen.getByText('Copy');
    expect(copyButton).toBeInTheDocument();
    act(() => copyButton.click());
    expect(clipboard.writeText).toHaveBeenCalledWith(codeBlockText);
  });
});
