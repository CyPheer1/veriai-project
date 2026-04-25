from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class FastApiDispatchRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    submission_id: UUID = Field(alias="submissionId")
    mode: Literal["QUICK", "FULL"]
    plan: Literal["FREE", "PRO"]
    word_count: int = Field(alias="wordCount", ge=0)
