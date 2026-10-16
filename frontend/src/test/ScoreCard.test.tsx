import { render, screen } from '@testing-library/react';
import { ScoreCard } from '../components/common/ScoreCard';

describe('ScoreCard', () => {
  it('renders percentage score and title', () => {
    render(<ScoreCard title="Skill Coverage" score={85.5} type="coverage" />);
    expect(screen.getByText('Skill Coverage')).toBeInTheDocument();
    expect(screen.getByText('85.5%')).toBeInTheDocument();
    expect(screen.getByText('High Alignment')).toBeInTheDocument();
  });

  it('handles null score gracefully', () => {
    render(<ScoreCard title="Skill Coverage" score={null} type="coverage" />);
    expect(screen.getByText('Skill Coverage')).toBeInTheDocument();
    expect(screen.getByText('N/A')).toBeInTheDocument();
  });
});
