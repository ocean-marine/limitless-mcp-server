import os

from src.my_project.__main__ import _load_env


def test_load_env() -> None:
    _load_env()
    assert os.getenv("DUMMY_ENV") == "VALUE"
