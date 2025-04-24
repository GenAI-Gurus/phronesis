import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import '@testing-library/jest-dom';
import { describe, it, beforeEach, afterEach, vi, expect } from 'vitest';
import NewDecisionPage from '../../src/pages/NewDecisionPage';
import api from '../../src/api/client';
import { MemoryRouter } from 'react-router-dom';

// Mock fetch for API calls
beforeEach(() => {
  // Mock XMLHttpRequest to prevent preflight errors in JSDOM
  vi.stubGlobal('XMLHttpRequest', class {
    onload: (() => void) | null = null;
    open() {}
    send() { this.onload && this.onload(); }
    setRequestHeader() {}
    get status() { return 200; }
    get readyState() { return 4; }
    get responseText() { return '{}'; }
    addEventListener() {}
    removeEventListener() {}
  });
  // Mock all fetch requests
  window.fetch = vi.fn().mockImplementation((url, options) => {
    // Mock POST request for form submission
    if (url.includes('/api') && options && options.method === 'POST') {
      if (options.body && options.body.includes('Test Title')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            title: 'Test Title',
            domain_tags: ['career'],
            sentiment_tag: 'positive',
            keywords: ['promotion', 'boss', 'work'],
          }),
        });
      } else {
        return Promise.reject(new Error('Simulated API error'));
      }
    }
    // Mock any other request (preflight, GET, etc.)
    return Promise.resolve({
      ok: true,
      json: async () => ({}),
    });
  });
  // Mock JWT to simulate logged-in user
  vi.spyOn(window.localStorage.__proto__, 'getItem').mockImplementation((key) => {
    if (key === 'jwt') return 'FAKE_TOKEN';
    return null;
  });
});
afterEach(() => {
  vi.resetAllMocks();
  window.localStorage.clear();
});

describe('NewDecisionPage', () => {
  it('renders the form and submits successfully, displaying auto-tags', async () => {
    vi.spyOn(api, 'post').mockResolvedValue({
      data: {
        title: 'Test Title',
        domain_tags: ['career'],
        sentiment_tag: 'positive',
        keywords: ['promotion', 'boss', 'work'],
      }
    });
    (window.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        title: 'Test Title',
        domain_tags: ['career'],
        sentiment_tag: 'positive',
        keywords: ['promotion', 'boss', 'work'],
      }),
    });
    render(
  <MemoryRouter>
    <NewDecisionPage />
  </MemoryRouter>
);
    fireEvent.change(screen.getByLabelText(/title/i, { exact: false }), { target: { value: 'Test Title' } });
    fireEvent.change(screen.getByLabelText(/context/i, { exact: false }), { target: { value: 'Test context' } });
    fireEvent.change(screen.getByLabelText(/anticipated outcomes/i, { exact: false }), { target: { value: 'Outcome' } });
    fireEvent.change(screen.getByLabelText(/values/i, { exact: false }), { target: { value: 'integrity' } });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    await waitFor(() => {
      expect(screen.getByText(/ai-generated tags/i)).toBeInTheDocument();
      expect(screen.getByText(/career/i)).toBeInTheDocument();
      expect(screen.getByText(/positive/i)).toBeInTheDocument();
      expect(screen.getByText(/promotion/i)).toBeInTheDocument();
    });
  });

  it('shows error on API failure', async () => {
    vi.spyOn(api, 'post').mockRejectedValue(new Error('Simulated API error'));

    render(
  <MemoryRouter>
    <NewDecisionPage />
  </MemoryRouter>
);
    fireEvent.change(screen.getByLabelText(/title/i, { exact: false }), { target: { value: 'Test Title' } });
    fireEvent.change(screen.getByLabelText(/context/i, { exact: false }), { target: { value: 'Test context' } });
    fireEvent.change(screen.getByLabelText(/anticipated outcomes/i, { exact: false }), { target: { value: 'Outcome' } });
    fireEvent.change(screen.getByLabelText(/values/i, { exact: false }), { target: { value: 'integrity' } });
    // Use act to flush all React state updates
    await act(async () => {
      await fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    });
    // Debug: log the DOM before the assertion
    // eslint-disable-next-line no-console
    console.log(document.body.innerHTML);
    // Assert on the alert role for error
    expect(await screen.findByRole('alert')).toHaveTextContent(/simulated api error/i);
  });
});
