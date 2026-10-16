import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ApplicationTrackerPage } from '../pages/ApplicationTrackerPage';
import { api } from '../api/client';

vi.mock('../api/client', () => ({
  api: {
    getApplications: vi.fn(),
    createApplication: vi.fn(),
    updateApplication: vi.fn(),
    deleteApplication: vi.fn(),
  },
}));

describe('ApplicationTrackerPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('shows API errors separately from an empty tracker and supports retry', async () => {
    vi.mocked(api.getApplications)
      .mockRejectedValueOnce(new Error('Network connection failed'))
      .mockResolvedValueOnce({ items: [], total: 0, page: 1, page_size: 15, total_pages: 1 });

    render(<ApplicationTrackerPage />);

    const error = await screen.findByRole('alert');
    expect(error).toHaveTextContent('Network connection failed');
    expect(screen.queryByText('No applications found')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));

    await waitFor(() => {
      expect(screen.getByText('No applications found')).toBeInTheDocument();
    });
    expect(api.getApplications).toHaveBeenCalledTimes(2);
  });
});