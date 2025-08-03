import os
import sys


def validate_api_key():
    """Validate and export LIMITLESS_API_KEY environment variable."""
    api_key = os.getenv("LIMITLESS_API_KEY")

    if not api_key:
        print(
            "Error: LIMITLESS_API_KEY environment variable is not set", file=sys.stderr
        )
        sys.exit(1)

    if not api_key.strip():
        print("Error: LIMITLESS_API_KEY is empty", file=sys.stderr)
        sys.exit(1)

    return api_key


LIMITLESS_API_KEY = validate_api_key()
