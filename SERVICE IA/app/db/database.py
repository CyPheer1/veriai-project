from contextlib import contextmanager

from sqlalchemy import create_engine
from sqlalchemy.engine.url import make_url
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.core.config import get_settings

settings = get_settings()

db_url = settings.database_url
if "sslmode=" not in db_url:
    try:
        url = make_url(db_url)
        if url.drivername.startswith("postgres"):
            host = (url.host or "").lower()
            if host not in {"localhost", "127.0.0.1", "postgres"}:
                query = dict(url.query)
                if "sslmode" not in query:
                    query["sslmode"] = "require"
                    db_url = url.set(query=query).render_as_string(hide_password=False)
    except Exception:
        pass

engine = create_engine(
    db_url,
    pool_pre_ping=True,
    pool_recycle=1800,
)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


@contextmanager
def session_scope():
    session = SessionLocal()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()
