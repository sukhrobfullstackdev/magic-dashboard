import { FormCard } from '@components/presentation/form-card';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

const expectReadOnlyContent = 'I is read only <3';
const expectEditContent = 'You can edit me';

const deafultProps = {
  editView: <div>{expectEditContent}</div>,
  readonlyView: <div>{expectReadOnlyContent}</div>,
  title: 'I is title',
  onCancel: jest.fn(),
  onSave: jest.fn(),
  onEdit: jest.fn(),
  isFormValid: false,
  isReadOnlyView: true,
};

test('renders readonly view', async () => {
  render(<FormCard {...deafultProps} />);

  expect(screen.getByText(expectReadOnlyContent)).toBeInTheDocument();
});

test('renders edit view when edit is pressed', async () => {
  const { rerender } = render(<FormCard {...deafultProps} />);
  fireEvent.click(screen.getByText('Edit'));
  rerender(<FormCard {...deafultProps} isReadOnlyView={false} />);
  expect(screen.getByText(expectEditContent)).toBeInTheDocument();
});

test('cancel button returns to readonly firing onCancel', async () => {
  const { rerender } = render(<FormCard {...deafultProps} />);

  fireEvent.click(screen.getByText('Edit'));
  rerender(<FormCard {...deafultProps} isReadOnlyView={false} />);
  expect(screen.getByText(expectEditContent)).toBeInTheDocument();

  fireEvent.click(screen.getByText('Cancel'));
  rerender(<FormCard {...deafultProps} />);
  expect(screen.getByText(expectReadOnlyContent)).toBeInTheDocument();
  expect(deafultProps.onCancel).toHaveBeenCalled();
});

test('save button is disabled if form is invalid', async () => {
  const { rerender } = render(<FormCard {...deafultProps} isFormValid={false} />);

  fireEvent.click(screen.getByText('Edit'));
  rerender(<FormCard {...deafultProps} isFormValid={false} isReadOnlyView={false} />);
  expect(screen.getByText(expectEditContent)).toBeInTheDocument();
  expect(screen.getByText('Save').closest('button')).toBeDisabled();

  fireEvent.click(screen.getByText('Save'));
  expect(screen.getByText(expectEditContent)).toBeInTheDocument();
  expect(deafultProps.onSave).not.toHaveBeenCalled();
});

test('save button is enabled if form is valid', async () => {
  const { rerender } = render(<FormCard {...deafultProps} isFormValid />);

  fireEvent.click(screen.getByText('Edit'));
  rerender(<FormCard {...deafultProps} isFormValid isReadOnlyView={false} />);
  expect(screen.getByText(expectEditContent)).toBeInTheDocument();
  expect(screen.getByText('Save').closest('button')).toBeEnabled();
});

test('save button is disabled while form is saving', async () => {
  const { rerender } = render(<FormCard {...deafultProps} isFormValid />);

  fireEvent.click(screen.getByText('Edit'));
  rerender(<FormCard {...deafultProps} isFormValid isReadOnlyView={false} />);
  expect(screen.getByText(expectEditContent)).toBeInTheDocument();
  expect(screen.getByText('Save').closest('button')).toBeEnabled();

  const saveButton = screen.getByRole('button', { name: /Save/i });
  fireEvent.click(saveButton);
  rerender(<FormCard {...deafultProps} isFormValid isReadOnlyView={false} />);
  expect(saveButton).toBeDisabled();
  rerender(<FormCard {...deafultProps} isFormValid />);
  await waitFor(() => expect(screen.getByText(expectReadOnlyContent)).toBeInTheDocument());
});
