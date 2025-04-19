import { render, screen, fireEvent, waitFor, within, act } from '@testing-library/react';
import ValueCalibrationPage from '../../src/pages/ValueCalibrationPage';
import * as api from '../../src/api/valueCalibration';

vi.mock('../../src/api/valueCalibration');

const VALUE_LIST = ['Courage', 'Honesty', 'Curiosity', 'Empathy', 'Resilience'];

describe('ValueCalibrationPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders sliders and submits a check-in successfully', async () => {
    (api.listValueCalibrationCheckins as any).mockResolvedValueOnce([]);
    (api.createValueCalibrationCheckin as any).mockResolvedValueOnce({ id: '1', user_id: 'u1', created_at: '2025-01-01T00:00:00Z', value_snapshot: '{"Courage":5,"Honesty":5,"Curiosity":5,"Empathy":5,"Resilience":5}' });
    render(<ValueCalibrationPage />);
    for (const value of VALUE_LIST) {
      expect(screen.getByTestId(`slider-${value}`)).toBeInTheDocument();
    }
    fireEvent.click(screen.getByTestId('submit-btn'));
    await waitFor(() => expect(screen.getByText(/check-in submitted/i)).toBeInTheDocument());
    expect(api.createValueCalibrationCheckin).toHaveBeenCalled();
  });

  it('shows check-in history', async () => {
    (api.listValueCalibrationCheckins as any).mockResolvedValueOnce([
      { id: '2', user_id: 'u1', created_at: '2025-01-02T00:00:00Z', value_snapshot: '{"Courage":6,"Honesty":7,"Curiosity":8,"Empathy":9,"Resilience":10}' }
    ]);
    render(<ValueCalibrationPage />);
    // Wait for history to render
    await waitFor(() => expect(screen.getByTestId('history-value-Resilience')).toHaveTextContent('10'));
    expect(screen.getByTestId('history-value-Courage')).toHaveTextContent('6');
  });

  it('shows error for invalid values', async () => {
    (api.listValueCalibrationCheckins as any).mockResolvedValueOnce([]);
    render(<ValueCalibrationPage initialValues={{ Courage: 0, Honesty: 5, Curiosity: 5, Empathy: 5, Resilience: 5 }} />);
    fireEvent.click(screen.getByTestId('submit-btn'));
    await waitFor(() => expect(screen.getByTestId('form-error')).toBeInTheDocument());
  });

  it('shows API error on submit failure', async () => {
    (api.listValueCalibrationCheckins as any).mockResolvedValueOnce([]);
    (api.createValueCalibrationCheckin as any).mockRejectedValueOnce(new Error('fail'));
    render(<ValueCalibrationPage />);
    fireEvent.click(screen.getByTestId('submit-btn'));
    await waitFor(() => expect(screen.getByText(/failed to submit/i)).toBeInTheDocument());
  });

  it('shows error if history fails to load', async () => {
    (api.listValueCalibrationCheckins as any).mockRejectedValueOnce(new Error('fail'));
    render(<ValueCalibrationPage />);
    await waitFor(() => expect(screen.getByText(/failed to load check-in history/i)).toBeInTheDocument());
  });
});
