import os
import pytest
import httpx
from unittest.mock import AsyncMock, patch, MagicMock

from packages.domain.agent.provider import (
    NvidiaNimProvider,
    NoLLMProvider,
    OllamaProvider,
    create_default_provider,
)


@pytest.mark.asyncio
async def test_nvidia_provider_health_check_offline_when_no_key():
    """Verify provider reports offline when NVIDIA_API_KEY is not set."""
    provider = NvidiaNimProvider(api_key="")
    health = await provider.health_check()
    assert health.provider == "nvidia_nim"
    assert health.status == "offline"
    assert "not configured" in health.details.lower()


@pytest.mark.asyncio
async def test_nvidia_provider_health_check_healthy():
    """Verify provider reports healthy when endpoint returns 200."""
    provider = NvidiaNimProvider(api_key="nvapi-test-key")

    mock_response = MagicMock(status_code=200)
    with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = mock_response
        health = await provider.health_check()
        assert health.provider == "nvidia_nim"
        assert health.status == "healthy"
        assert "connected" in health.details.lower()


@pytest.mark.asyncio
async def test_nvidia_provider_health_check_unauthorized():
    """Verify provider reports unauthorized when endpoint returns 401."""
    provider = NvidiaNimProvider(api_key="nvapi-invalid-key")

    mock_response = MagicMock(status_code=401)
    with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = mock_response
        health = await provider.health_check()
        assert health.status == "unauthorized"


@pytest.mark.asyncio
async def test_nvidia_provider_generate_success():
    """Verify successful parsing of OpenAI-compatible response from NVIDIA NIM."""
    provider = NvidiaNimProvider(api_key="nvapi-test-key", model="meta/llama-3.3-70b-instruct")

    mock_data = {
        "choices": [
            {
                "message": {
                    "role": "assistant",
                    "content": "To reduce emissions, right-size idle servers and schedule workloads off-peak.",
                }
            }
        ],
        "usage": {"total_tokens": 42},
    }
    mock_response = MagicMock(status_code=200)
    mock_response.json.return_value = mock_data

    with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
        mock_post.return_value = mock_response
        res = await provider.generate(prompt="How to reduce emissions?")
        assert res.fallback_used is False
        assert res.provider == "nvidia_nim"
        assert res.model == "meta/llama-3.3-70b-instruct"
        assert "right-size idle servers" in res.content
        assert res.tokens_used == 42


@pytest.mark.asyncio
async def test_nvidia_provider_fallback_on_network_error():
    """Verify automatic fallback to NoLLMProvider on connection timeout or failure."""
    provider = NvidiaNimProvider(api_key="nvapi-test-key")

    with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
        mock_post.side_effect = httpx.ConnectError("Network connection refused")
        res = await provider.generate(prompt="How to reduce emissions?")
        assert res.fallback_used is True
        assert res.provider == "no-llm-fallback"
        assert res.content != ""


def test_create_default_provider_selection():
    """Verify factory returns appropriate provider based on environment."""
    # 1. When NVIDIA_API_KEY is present
    with patch.dict(os.environ, {"LLM_PROVIDER": "auto", "NVIDIA_API_KEY": "nvapi-some-key"}):
        p = create_default_provider()
        assert isinstance(p, NvidiaNimProvider)

    # 2. When LLM_PROVIDER is explicit nvidia
    with patch.dict(os.environ, {"LLM_PROVIDER": "nvidia", "NVIDIA_API_KEY": ""}):
        p = create_default_provider()
        assert isinstance(p, NvidiaNimProvider)

    # 3. When LLM_PROVIDER is explicit none
    with patch.dict(os.environ, {"LLM_PROVIDER": "none"}):
        p = create_default_provider()
        assert isinstance(p, NoLLMProvider)

    # 4. Default without key falls back to OllamaProvider
    with patch.dict(os.environ, {"LLM_PROVIDER": "auto", "NVIDIA_API_KEY": ""}):
        p = create_default_provider()
        assert isinstance(p, OllamaProvider)
