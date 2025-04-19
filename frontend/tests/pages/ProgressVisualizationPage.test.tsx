// Polyfill ResizeObserver for Recharts in Vitest
global.ResizeObserver = global.ResizeObserver || class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import ProgressVisualizationPage from "../../src/pages/ProgressVisualizationPage";
import * as api from "../../src/api/progress";
import React from "react";

vi.mock("../../src/api/progress");
const mockGetValueCalibrationCheckins = api.getValueCalibrationCheckins as unknown as ReturnType<typeof vi.fn>;
const mockGetDecisionJournalEntries = api.getDecisionJournalEntries as unknown as ReturnType<typeof vi.fn>;

describe("ProgressVisualizationPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders value trends and journal activity charts (expected use)", async () => {
    mockGetValueCalibrationCheckins.mockResolvedValue([
      { checkin_date: "2025-04-01", value_snapshot: { Courage: 7, Honesty: 8 } },
      { checkin_date: "2025-04-08", value_snapshot: { Courage: 8, Honesty: 7 } },
    ]);
    mockGetDecisionJournalEntries.mockResolvedValue([
      { created_at: "2025-04-02" },
      { created_at: "2025-04-03" },
      { created_at: "2025-04-10" },
    ]);
    render(<ProgressVisualizationPage />);
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /value trends/i })).toBeInTheDocument();
expect(screen.getByRole("heading", { name: /decision journal activity/i })).toBeInTheDocument();
    });
  });

  it("shows empty state for no data (edge case)", async () => {
    mockGetValueCalibrationCheckins.mockResolvedValue([]);
    mockGetDecisionJournalEntries.mockResolvedValue([]);
    render(<ProgressVisualizationPage />);
    await waitFor(() => {
      expect(screen.getByText(/not enough value check-ins/i)).toBeInTheDocument();
      expect(screen.getByText(/no journal entries yet/i)).toBeInTheDocument();
    });
  });

  it("shows error message on API failure (failure case)", async () => {
    mockGetValueCalibrationCheckins.mockRejectedValue({ response: { data: { detail: "API fail" } } });
    mockGetDecisionJournalEntries.mockResolvedValue([]);
    render(<ProgressVisualizationPage />);
    await waitFor(() => {
      expect(screen.getByText(/api fail/i)).toBeInTheDocument();
    });
  });
});
