from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class EnqueueResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    task_id: str = Field(alias="taskId")
    submission_id: UUID = Field(alias="submissionId")
    status: str


class HealthResponse(BaseModel):
    status: str
    models_loaded: bool
    device: str
