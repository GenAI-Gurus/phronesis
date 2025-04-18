import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DecisionJournalPage from '../DecisionJournalPage';
import * as journalApi from '../../api/journal';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

vi.mock('../../api/journal');

const mockEntries = [
  {
    id: '1',
    user_id: 'u1',
    title: 'Test Entry',
    context: 'Some context',
    anticipated_outcomes: 'Some outcome',
    values: ['courage'],
    domain: 'career',
    sentiment: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

describe('DecisionJournalPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders entries and allows editing', async () => {
    (journalApi.listJournalEntries as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockEntries);
    render(<DecisionJournalPage />);
    expect(await screen.findByText('Test Entry')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('edit'));
    expect(screen.getByText('Edit Journal Entry')).toBeInTheDocument();
  });

  it('shows new entry dialog and submits', async () => {
    (journalApi.listJournalEntries as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (journalApi.createJournalEntry as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ ...mockEntries[0], id: '2', title: 'New Entry' });
    render(<DecisionJournalPage />);
    await waitFor(() => expect(screen.getByText('No journal entries yet.')).toBeInTheDocument());
    fireEvent.click(screen.getByText('New Entry'));
    await screen.findByText(/New Journal Entry/i); // Wait for dialog title
    const titleInput = await screen.findByRole('textbox', { name: /title/i });
    fireEvent.change(titleInput, { target: { value: 'New Entry' } });
    fireEvent.click(screen.getByText('Create'));
    await waitFor(() => expect(journalApi.createJournalEntry).toHaveBeenCalled());
  });

  it('handles API errors gracefully', async () => {
    (journalApi.listJournalEntries as unknown as ReturnType<typeof vi.fn>).mockRejectedValue({ response: { data: { detail: 'API Error' } } });
    render(<DecisionJournalPage />);
    expect(await screen.findByText('API Error')).toBeInTheDocument();
  });
});
