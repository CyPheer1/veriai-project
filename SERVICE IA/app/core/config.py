from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore", case_sensitive=False)

    app_env: str = Field(default="dev", alias="APP_ENV")

    database_url: str = Field(
        default="postgresql+psycopg2://veriai_user:veriai_dev_password@localhost:5432/veriai",
        alias="DATABASE_URL",
    )

    redis_url: str = Field(default="redis://localhost:6379/0", alias="REDIS_URL")
    celery_broker_url: str = Field(default="redis://localhost:6379/0", alias="CELERY_BROKER_URL")
    celery_result_backend: str = Field(default="redis://localhost:6379/1", alias="CELERY_RESULT_BACKEND")

    huggingface_model_name: str = Field(
        default="mehddii/roberta-aigt-finetuning-v4", alias="HUGGINGFACE_MODEL_NAME"
    )
    gpt2_model_name: str = Field(default="gpt2-medium", alias="GPT2_MODEL_NAME")
    hf_home: str = Field(default="/models-cache", alias="HF_HOME")

    internal_service_token: str = Field(
        default="change-me-internal-token", alias="INTERNAL_SERVICE_TOKEN"
    )

    chunk_min_words: int = Field(default=120, alias="CHUNK_MIN_WORDS")
    chunk_max_words: int = Field(default=512, alias="CHUNK_MAX_WORDS")
    chunk_min_process_words: int = Field(default=50, alias="CHUNK_MIN_PROCESS_WORDS")
    reliability_min_words: int = Field(default=120, alias="RELIABILITY_MIN_WORDS")

    full_mode_layer1_weight: float = Field(default=0.6, alias="FULL_MODE_LAYER1_WEIGHT")
    full_mode_layer2_weight: float = Field(default=0.2, alias="FULL_MODE_LAYER2_WEIGHT")
    full_mode_layer3_weight: float = Field(default=0.2, alias="FULL_MODE_LAYER3_WEIGHT")
    ai_label_threshold: float = Field(default=0.5, alias="AI_LABEL_THRESHOLD")
    default_confidence: float = Field(default=0.5, alias="DEFAULT_CONFIDENCE")

    celery_task_max_retries: int = Field(default=3, alias="CELERY_TASK_MAX_RETRIES")
    celery_retry_backoff_base: int = Field(default=2, alias="CELERY_RETRY_BACKOFF_BASE")
    celery_watchdog_schedule_seconds: float = Field(default=600.0, alias="CELERY_WATCHDOG_SCHEDULE_SECONDS")
    celery_watchdog_stuck_minutes: int = Field(default=30, alias="CELERY_WATCHDOG_STUCK_MINUTES")

    load_models_on_startup: bool = Field(default=True, alias="LOAD_MODELS_ON_STARTUP")


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
