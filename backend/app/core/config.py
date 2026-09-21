import os
from dotenv import load_dotenv
from sqlalchemy.engine import make_url

load_dotenv()


class Settings:
    def __init__(self) -> None:
        self.DATABASE_URL = os.getenv("DATABASE_URL")
        # Tests must opt in to a separate database; they must never fall back
        # to DATABASE_URL.
        self.TEST_DATABASE_URL = os.getenv("TEST_DATABASE_URL")
        self.JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
        self.JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
        self.ACCESS_TOKEN_EXPIRE_MINUTES = int(
            os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30")
        )


settings = Settings()


def _database_target(url: str) -> tuple[str, str | None, int | None, str | None]:
    """Compare database destinations without considering credentials/options."""
    parsed = make_url(url)
    default_port = 3306 if parsed.get_backend_name() == "mysql" else None
    return (
        parsed.get_backend_name(),
        parsed.host.lower() if parsed.host else None,
        parsed.port or default_port,
        parsed.database,
    )


def require_test_database_url() -> str:
    """Return the explicitly configured test database URL or fail closed."""
    test_url = settings.TEST_DATABASE_URL
    if not test_url:
        raise RuntimeError("TEST_DATABASE_URL is required for database tests.")
    if settings.DATABASE_URL and _database_target(test_url) == _database_target(settings.DATABASE_URL):
        raise RuntimeError("TEST_DATABASE_URL must target a different database than DATABASE_URL.")
    return test_url
