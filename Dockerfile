FROM python:3.11-slim-bookworm
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app
COPY pyproject.toml ./
COPY src/ ./src/

EXPOSE 8080
CMD [ "uv", "run", "-m", "src.my_project" ]