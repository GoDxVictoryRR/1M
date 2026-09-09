# TerraOps

TerraOps is an open-source, local-first sustainability decision-support system designed to turn operational data into prioritized, explainable environmental action plans (aligned with UN SDG 13 – Climate Action).

## Zero-Cost Architecture
- Built with 100% open-source tools.
- Runs locally with zero required external API keys or cloud subscriptions.
- Deterministic calculation engine for emissions, energy, anomaly detection, and recommendation ranking.
- Optional local AI explanation via Ollama (`qwen3.5:4b`) with automatic graceful fallback to deterministic templates.

## Quickstart

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm
- (Optional) Ollama with `qwen3.5:4b` for local AI explanations

### Local Development Setup

1. **Clone and Configure**:
   ```bash
   cp .env.example .env
   ```

2. **Backend**:
   ```bash
   uv run --extra dev uvicorn apps.api.main:app --reload --port 8000
   ```
   Or using standard venv:
   ```bash
   python -m venv .venv
   .venv/Scripts/activate
   pip install -e .[dev]
   uvicorn apps.api.main:app --reload --port 8000
   ```

3. **Frontend**:
   ```bash
   cd apps/web
   npm install
   npm run dev
   ```

4. **Running Tests**:
   ```bash
   uv run --extra dev pytest -v
   ```
