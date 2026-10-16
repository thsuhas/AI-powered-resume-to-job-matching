import { render, screen } from '@testing-library/react';
import { StatusBadge } from '../components/common/StatusBadge';

describe('StatusBadge', () => {
  it('renders Offer status correctly', () => {
    render(<StatusBadge status="Offer" />);
    expect(screen.getByText('Offer')).toBeInTheDocument();
  });

  it('renders Applied status correctly', () => {
    render(<StatusBadge status="Applied" />);
    expect(screen.getByText('Applied')).toBeInTheDocument();
  });

  it('renders Rejected status correctly', () => {
    render(<StatusBadge status="Rejected" />);
    expect(screen.getByText('Rejected')).toBeInTheDocument();
  });
});
