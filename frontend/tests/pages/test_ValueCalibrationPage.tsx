import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ValueCalibrationPage from '../../../src/pages/ValueCalibrationPage';

describe('ValueCalibrationPage', () => {
  it('renders all value sliders and submit button', () => {
    render(<ValueCalibrationPage />);
    expect(screen.getByText(/Value Calibration/i)).toBeInTheDocument();
    expect(screen.getByTestId('slider-Courage')).toBeInTheDocument();
    expect(screen.getByTestId('slider-Honesty')).toBeInTheDocument();
    expect(screen.getByTestId('slider-Curiosity')).toBeInTheDocument();
    expect(screen.getByTestId('slider-Empathy')).toBeInTheDocument();
    expect(screen.getByTestId('slider-Resilience')).toBeInTheDocument();
    expect(screen.getByTestId('submit-btn')).toBeInTheDocument();
  });

  it('shows success message on submit', async () => {
    render(<ValueCalibrationPage />);
    fireEvent.click(screen.getByTestId('submit-btn'));
    await waitFor(() => {
      expect(screen.getByText(/Check-in submitted/i)).toBeInTheDocument();
    });
  });

  it('shows error if any value is set out of bounds', async () => {
    render(<ValueCalibrationPage />);
    const slider = screen.getByTestId('slider-Courage').querySelector('input');
    if (slider) {
      fireEvent.change(slider, { target: { value: 0 } });
    }
    fireEvent.click(screen.getByTestId('submit-btn'));
    await waitFor(() => {
      expect(screen.getByTestId('form-error')).toBeInTheDocument();
    });
  });
});
