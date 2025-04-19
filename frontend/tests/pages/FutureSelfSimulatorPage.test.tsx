import '@testing-library/jest-dom';
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import FutureSelfSimulatorPage from "../../src/pages/FutureSelfSimulatorPage";
import * as api from "../../src/api/futureSelf";
import React from "react";

vi.mock("../../src/api/futureSelf");
const mockSimulateFutureSelf = api.simulateFutureSelf as unknown as ReturnType<typeof vi.fn>;

describe("FutureSelfSimulatorPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders form and submits expected use case", async () => {
    mockSimulateFutureSelf.mockResolvedValue({
      future_projection: "You thrive in a new city.",
      suggestions: ["Network with locals."],
      ai_generated: true,
    });
    render(<FutureSelfSimulatorPage />);
    fireEvent.change(screen.getByLabelText(/decision context/i), {
      target: { value: "Should I move?" },
    });
    fireEvent.change(screen.getByLabelText(/add value/i), {
      target: { value: "growth" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^add$/i }));
    fireEvent.change(screen.getByLabelText(/time horizon/i), {
      target: { value: "2 years" },
    });
    fireEvent.click(screen.getByRole("button", { name: /simulate/i }));
    expect(mockSimulateFutureSelf).toHaveBeenCalledWith({
      decision_context: "Should I move?",
      values: ["growth"],
      time_horizon: "2 years",
    });
    await waitFor(() => {
      expect(screen.getByText(/you thrive in a new city/i)).toBeInTheDocument();
      expect(screen.getByText(/network with locals/i)).toBeInTheDocument();
    });
  });

  it("shows validation error if context is missing (edge case)", async () => {
    render(<FutureSelfSimulatorPage />);
    fireEvent.click(screen.getByRole("button", { name: /simulate/i }));
    expect(screen.getByLabelText(/decision context/i)).toHaveAttribute("required");
  });

  it("shows API error message (failure case)", async () => {
    mockSimulateFutureSelf.mockRejectedValue({ response: { data: { detail: "API failure" } } });
    render(<FutureSelfSimulatorPage />);
    fireEvent.change(screen.getByLabelText(/decision context/i), {
      target: { value: "Should I move?" },
    });
    fireEvent.click(screen.getByRole("button", { name: /simulate/i }));
    await waitFor(() => {
      expect(screen.getByText(/api failure/i)).toBeInTheDocument();
    });
  });
});
