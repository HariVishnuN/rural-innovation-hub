import logging
from typing import Generator
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings
from app.db.base import Base

logger = logging.getLogger(__name__)

# MySQL connection engine configured with pooling and health checks
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=settings.DB_POOL_PRE_PING,
    pool_recycle=settings.DB_POOL_RECYCLE,
    pool_size=settings.DB_POOL_SIZE,
    max_overflow=settings.DB_MAX_OVERFLOW,
    echo=False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """Dependency that yields a database session and safely closes it."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """Creates tables if they do not exist."""
    try:
        # Import all models to register with Base metadata
        import app.models  # noqa: F401
        Base.metadata.create_all(bind=engine)

        # Check and migrate columns on existing tables
        with engine.connect() as conn:
            try:
                conn.execute(text("ALTER TABLE inventions ADD COLUMN scaling_stage ENUM('RAW_PROTOTYPE', 'PEER_VALIDATED', 'FIELD_TESTED', 'MARKET_READY') NOT NULL DEFAULT 'RAW_PROTOTYPE' AFTER field_tested;"))
                conn.commit()
            except Exception:
                pass

            try:
                conn.execute(text("ALTER TABLE users ADD COLUMN username VARCHAR(50) UNIQUE AFTER full_name;"))
                conn.commit()
            except Exception:
                pass

            try:
                conn.execute(text("ALTER TABLE users ADD COLUMN pin_hash VARCHAR(255) NULL AFTER password_hash;"))
                conn.commit()
            except Exception:
                pass

            try:
                conn.execute(text("ALTER TABLE commercial_offers MODIFY COLUMN offer_type VARCHAR(50) NOT NULL DEFAULT 'BUY';"))
                conn.commit()
            except Exception:
                pass

            try:
                conn.execute(text("ALTER TABLE commercial_offers MODIFY COLUMN status VARCHAR(50) NOT NULL DEFAULT 'PENDING';"))
                conn.commit()
            except Exception:
                pass

            try:
                conn.execute(text("ALTER TABLE commercial_offers ADD COLUMN buyer_id INT NULL AFTER official_id;"))
                conn.commit()
            except Exception:
                pass

            try:
                conn.execute(text("ALTER TABLE commercial_offers ADD COLUMN amount_inr DECIMAL(12, 2) NULL AFTER proposed_amount;"))
                conn.commit()
            except Exception:
                pass

            try:
                conn.execute(text("CREATE TABLE IF NOT EXISTS email_otps (id INT AUTO_INCREMENT PRIMARY KEY, email VARCHAR(255) NOT NULL, otp_code VARCHAR(6) NOT NULL, expires_at DATETIME NOT NULL, is_used BOOLEAN NOT NULL DEFAULT 0, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, INDEX idx_email (email));"))
                conn.commit()
            except Exception:
                pass

            try:
                conn.execute(text("CREATE TABLE IF NOT EXISTS official_shortlists (id INT AUTO_INCREMENT PRIMARY KEY, official_id INT NOT NULL, invention_id INT NOT NULL, innovator_id INT NULL, notes TEXT NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, INDEX idx_off (official_id), INDEX idx_inv (invention_id));"))
                conn.commit()
            except Exception:
                pass

        logger.info("Database tables initialized successfully via Base.metadata.create_all().")
    except Exception as e:
        logger.warning(f"Database initialization warning (will retry on incoming requests): {e}")
