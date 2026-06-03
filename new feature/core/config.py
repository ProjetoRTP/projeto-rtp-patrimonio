from dotenv import load_dotenv
import os

load_dotenv()

class Settings:

    SECRET_KEY = os.getenv(
        "SECRET_KEY",
        "default_secret"
    )

    ALGORITHM = os.getenv(
        "ALGORITHM",
        "HS256"
    )

    ACCESS_TOKEN_EXPIRE_MINUTES = int(
        os.getenv(
            "ACCESS_TOKEN_EXPIRE_MINUTES",
            120
        )
    )

settings = Settings()