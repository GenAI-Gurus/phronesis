import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import GamificationPage from "../../src/pages/GamificationPage";
import * as api from "../../src/api/gamification";
import React from "react";

vi.mock("../../src/api/gamification");
const mockGetBadges = api.getBadges as unknown as ReturnType<typeof vi.fn>;
const mockGetStreaks = api.getStreaks as unknown as ReturnType<typeof vi.fn>;
const mockGetChallenges = api.getChallenges as unknown as ReturnType<typeof vi.fn>;
const mockCompleteChallenge = api.completeChallenge as unknown as ReturnType<typeof vi.fn>;

describe("GamificationPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders badges, streaks, and challenges (expected use)", async () => {
    mockGetBadges.mockResolvedValue([
      { id: "b1", name: "7-Day Streak", description: "Check in 7 days", awarded_at: "2025-04-19T12:00:00Z" },
    ]);
    mockGetStreaks.mockResolvedValue([
      { id: "s1", streak_count: 7, last_checkin: "2025-04-19T12:00:00Z" },
    ]);
    mockGetChallenges.mockResolvedValue([
      { id: "c1", name: "First Reflection", description: "Do your first reflection", is_active: true, completed_at: null },
      { id: "c2", name: "7 Check-ins", description: "Check in 7 days", is_active: true, completed_at: "2025-04-19T12:00:00Z" },
    ]);
    render(<GamificationPage />);
    await waitFor(() => {
      expect(screen.getByText(/7-day streak/i)).toBeInTheDocument();
      expect(screen.getAllByText(/check in 7 days/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/current streaks/i)).toBeInTheDocument();
      expect(screen.getAllByText(/first reflection/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/mark as completed/i)).toBeInTheDocument();
    });
  });

  it("shows empty state for no data (edge case)", async () => {
    mockGetBadges.mockResolvedValue([]);
    mockGetStreaks.mockResolvedValue([]);
    mockGetChallenges.mockResolvedValue([]);
    render(<GamificationPage />);
    await waitFor(() => {
      expect(screen.getByText(/no badges earned yet/i)).toBeInTheDocument();
      expect(screen.getByText(/no streaks yet/i)).toBeInTheDocument();
      expect(screen.getByText(/no challenges yet/i)).toBeInTheDocument();
    });
  });

  it("shows API error message (failure case)", async () => {
    mockGetBadges.mockRejectedValue({ response: { data: { detail: "API fail" } } });
    mockGetStreaks.mockResolvedValue([]);
    mockGetChallenges.mockResolvedValue([]);
    render(<GamificationPage />);
    await waitFor(() => {
      expect(screen.getByText(/api fail/i)).toBeInTheDocument();
    });
  });

  it("can complete a challenge", async () => {
    mockGetBadges.mockResolvedValue([]);
    mockGetStreaks.mockResolvedValue([]);
    mockGetChallenges.mockResolvedValue([
      { id: "c1", name: "First Reflection", description: "Do your first reflection", is_active: true, completed_at: null },
    ]);
    mockCompleteChallenge.mockResolvedValue({
      id: "c1", name: "First Reflection", description: "Do your first reflection", is_active: true, completed_at: "2025-04-20T12:00:00Z"
    });
    render(<GamificationPage />);
    await waitFor(() => {
      expect(screen.getByText(/mark as completed/i)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText(/mark as completed/i));
    await waitFor(() => {
      expect(mockCompleteChallenge).toHaveBeenCalledWith("c1");
    });
  });
});
