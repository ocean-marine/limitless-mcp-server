import os

from dotenv import load_dotenv


def _load_env() -> None:
    load_dotenv()


if __name__ == "__main__":
    _load_env()
    print(os.getenv("DUMMY_ENV"))
