FROM python:3.11-slim

WORKDIR /app

# Install system utilities
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install uv for fast Python package management
COPY --from=ghcr.io/astral-sh/uv:0.11.0 /uv /uvx /bin/

# Copy project definition
COPY pyproject.toml README.md .env.example ./
COPY apps/ apps/
COPY packages/ packages/
COPY data/ data/

# Install dependencies into system environment
RUN uv pip install --system -e .

EXPOSE 8000

CMD ["uvicorn", "apps.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
