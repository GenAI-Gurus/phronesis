import axios from "./client";

export interface FutureSelfSimulationRequest {
  decision_context: string;
  values?: string[];
  time_horizon?: string;
}

export interface FutureSelfSimulationResponse {
  future_projection: string;
  suggestions?: string[];
  ai_generated: boolean;
}

export async function simulateFutureSelf(
  payload: FutureSelfSimulationRequest
): Promise<FutureSelfSimulationResponse> {
  const response = await axios.post<FutureSelfSimulationResponse>(
    "/future-self/simulate",
    payload
  );
  return response.data;
}
