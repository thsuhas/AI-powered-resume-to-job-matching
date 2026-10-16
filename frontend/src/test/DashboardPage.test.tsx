import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { DashboardPage } from '../pages/DashboardPage';
import { api } from '../api/client';

vi.mock('../api/client', () => ({
  api: {
    getDashboardSummary: vi.fn(),
    getStatusDistribution: vi.fn(),
    getUpcomingFollowups: vi.fn(),
  },
}));

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially and then empty dashboard when 0 applications', async () => {
    vi.mocked(api.getDashboardSummary).mockResolvedValue({
      total_applications: 0,
      applications_by_status: {},
      upcoming_followups_count: 0,
      total_analyses: 0,
      average_similarity_score: null,
      average_skill_coverage_score: null,
      recent_applications: [],
      recent_analyses: [],
    });
    vi.mocked(api.getStatusDistribution).mockResolvedValue([]);
    vi.mocked(api.getUpcomingFollowups).mockResolvedValue([]);

    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Your application tracker is empty')).toBeInTheDocument();
    });
    expect(screen.getByText('Analyze First Resume')).toBeInTheDocument();
  });

  it('renders error state when API fails', async () => {
    vi.mocked(api.getDashboardSummary).mockRejectedValue(new Error('Network connection failed'));
    vi.mocked(api.getStatusDistribution).mockResolvedValue([]);
    vi.mocked(api.getUpcomingFollowups).mockResolvedValue([]);

    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Unable to connect to backend service')).toBeInTheDocument();
      expect(screen.getByText('Network connection failed')).toBeInTheDocument();
    });
  });
});
