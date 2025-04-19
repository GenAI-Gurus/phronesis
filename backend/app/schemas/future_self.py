from pydantic import BaseModel, Field
from typing import List, Optional


class FutureSelfSimulationRequest(BaseModel):
    """
    Request schema for simulating a user's future self based on a decision context.
    """

    decision_context: str = Field(
        ..., description="Description of the user's decision or dilemma."
    )
    values: Optional[List[str]] = Field(
        None, description="List of core values relevant to this decision."
    )
    time_horizon: Optional[str] = Field(
        None,
        description="Optional time frame for the simulation (e.g., '1 year', '5 years').",
    )


class FutureSelfSimulationResponse(BaseModel):
    """
    Response schema for the AI-generated future self simulation.
    """

    future_projection: str = Field(
        ...,
        description="AI-generated narrative describing the likely future self and outcomes.",
    )
    suggestions: Optional[List[str]] = Field(
        None, description="Actionable suggestions or next steps."
    )
    ai_generated: bool = Field(
        True, description="Indicates if the response was generated by AI."
    )
