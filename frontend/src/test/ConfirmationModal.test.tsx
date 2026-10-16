import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmationModal } from '../components/common/ConfirmationModal';

describe('ConfirmationModal', () => {
  it('does not render when isOpen is false', () => {
    const { container } = render(
      <ConfirmationModal
        isOpen={false}
        title="Delete Item"
        message="Are you sure?"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders content and fires callbacks when open', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    render(
      <ConfirmationModal
        isOpen={true}
        title="Delete Item"
        message="Are you sure?"
        confirmLabel="Yes, Delete"
        cancelLabel="Cancel"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    expect(screen.getByText('Delete Item')).toBeInTheDocument();
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Yes, Delete'));
    expect(onConfirm).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
