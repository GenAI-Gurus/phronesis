import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LifeThemePage from "../../src/pages/LifeThemePage";
import * as api from "../../src/api/lifeTheme";
import React from "react";

vi.mock("../../src/api/lifeTheme");
const mockGetLifeTheme = api.getLifeTheme as unknown as ReturnType<typeof vi.fn>;
const mockSetLifeTheme = api.setLifeTheme as unknown as ReturnType<typeof vi.fn>;

describe("LifeThemePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders current theme and allows edit/save (expected)", async () => {
    mockGetLifeTheme.mockResolvedValue({
      id: "1",
      theme_text: "Growth through challenge",
      created_at: "2025-04-19T22:00:00Z",
      updated_at: "2025-04-19T22:00:00Z",
    });
    mockSetLifeTheme.mockResolvedValue({
      id: "2",
      theme_text: "Purposeful living",
      created_at: "2025-04-19T23:00:00Z",
      updated_at: "2025-04-19T23:00:00Z",
    });
    render(<LifeThemePage />);
    await waitFor(() => {
      expect(screen.getByText(/growth through challenge/i)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("button", { name: /edit/i }));
    fireEvent.change(screen.getByLabelText(/life theme/i), { target: { value: "Purposeful living" } });
    fireEvent.click(screen.getByRole("button", { name: /save/i }));
    await waitFor(() => {
      expect(mockSetLifeTheme).toHaveBeenCalledWith("Purposeful living");
      expect(screen.getByText(/purposeful living/i)).toBeInTheDocument();
      expect(screen.getByText(/life theme saved/i)).toBeInTheDocument();
    });
  });

  it("handles no theme yet (edge)", async () => {
    mockGetLifeTheme.mockResolvedValue(null);
    mockSetLifeTheme.mockResolvedValue({
      id: "1",
      theme_text: "New Theme",
      created_at: "2025-04-19T22:00:00Z",
      updated_at: "2025-04-19T22:00:00Z",
    });
    render(<LifeThemePage />);
    await waitFor(() => {
      expect(screen.getByLabelText(/life theme/i)).toBeInTheDocument();
    });
    fireEvent.change(screen.getByLabelText(/life theme/i), { target: { value: "New Theme" } });
    fireEvent.click(screen.getByRole("button", { name: /save/i }));
    await waitFor(() => {
      expect(mockSetLifeTheme).toHaveBeenCalledWith("New Theme");
      expect(screen.getByText(/new theme/i)).toBeInTheDocument();
    });
  });

  it("shows API error message (failure case)", async () => {
    mockGetLifeTheme.mockResolvedValue({
      id: "1",
      theme_text: "Growth through challenge",
      created_at: "2025-04-19T22:00:00Z",
      updated_at: "2025-04-19T22:00:00Z",
    });
    mockSetLifeTheme.mockRejectedValue({ response: { data: { detail: "API failure" } } });
    render(<LifeThemePage />);
    await waitFor(() => {
      expect(screen.getByText(/growth through challenge/i)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("button", { name: /edit/i }));
    fireEvent.change(screen.getByLabelText(/life theme/i), { target: { value: "Fail" } });
    fireEvent.click(screen.getByRole("button", { name: /save/i }));
    await waitFor(() => {
      expect(screen.getByText(/api failure/i)).toBeInTheDocument();
    });
  });
});
