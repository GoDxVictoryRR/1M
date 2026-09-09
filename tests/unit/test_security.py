import os
import re
import pytest
from httpx import AsyncClient, ASGITransport
from apps.api.main import app
from packages.domain.agent.tools import ToolRegistry

@pytest.mark.asyncio
async def test_path_traversal_rejection():
    """Verify that filenames containing traversal characters are rejected."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        files = {"file": ("../../etc/passwd.csv", b"timestamp,resource_id,energy_kwh\n2026-03-01T00:00:00Z,srv-1,10.0", "text/csv")}
        response = await client.post("/api/data/upload", files=files)
        assert response.status_code == 400
        assert "path traversal" in response.json()["detail"].lower()

@pytest.mark.asyncio
async def test_non_csv_rejection():
    """Verify that non-CSV file uploads are rejected with 400 Bad Request."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        files = {"file": ("malware.exe", b"binary content", "application/octet-stream")}
        response = await client.post("/api/data/upload", files=files)
        assert response.status_code == 400
        assert "only .csv files" in response.json()["detail"].lower()

@pytest.mark.asyncio
async def test_oversized_upload_rejection():
    """Verify that uploads exceeding 10MB are rejected with 413 Payload Too Large."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        large_content = b"a" * (10 * 1024 * 1024 + 100)
        files = {"file": ("large_data.csv", large_content, "text/csv")}
        response = await client.post("/api/data/upload", files=files)
        assert response.status_code == 413
        assert "exceeds maximum allowed size" in response.json()["detail"].lower()

def test_tool_sandbox_read_only_enforcement():
    """Verify that all registered agent tools are read-only and destructive tools are absent."""
    from packages.domain.agent.tools import ToolExecutionError
    registry = ToolRegistry()
    tools = registry.list_tools()
    
    allowlist = {
        "get_metrics",
        "get_anomalies",
        "get_forecast",
        "search_knowledge",
        "estimate_impact",
        "rank_interventions",
    }
    
    registered_names = {t.name for t in tools}
    assert registered_names == allowlist
    
    # Verify all tools have read_only = True
    for t in tools:
        assert t.read_only is True
    
    forbidden_terms = ["delete", "drop", "write", "exec", "shell", "bash", "system", "eval", "kill", "modify", "update"]
    for t in tools:
        name_lower = t.name.lower()
        for forbidden in forbidden_terms:
            assert forbidden not in name_lower, f"Dangerous term '{forbidden}' in tool name: {t.name}"

def test_tool_sandbox_rejects_unknown_tools():
    """Verify that invoking unknown tools raises a ToolExecutionError."""
    from packages.domain.agent.tools import ToolExecutionError
    registry = ToolRegistry()
    with pytest.raises(ToolExecutionError, match="Unauthorized tool 'execute_shell'"):
        registry.execute("execute_shell", {"command": "rm -rf /"})

def test_repository_secret_scanner():
    """Verify that no sensitive credentials, private keys, or API tokens are hardcoded."""
    patterns = [
        re.compile(r"sk-[a-zA-Z0-9]{20,}", re.IGNORECASE),
        re.compile(r"AKIA[0-9A-Z]{16}", re.IGNORECASE),
        re.compile(r"ghp_[a-zA-Z0-9]{36}", re.IGNORECASE),
        re.compile(r"-----BEGIN (RSA|EC|OPENSSH|PGP) PRIVATE KEY-----"),
    ]
    
    scan_dirs = ["apps", "packages", "data", "tests"]
    leaks = []
    
    for s_dir in scan_dirs:
        if not os.path.exists(s_dir):
            continue
        for root, _, files in os.walk(s_dir):
            for file in files:
                if file.endswith((".py", ".ts", ".tsx", ".json", ".md", ".env", ".example")):
                    filepath = os.path.join(root, file)
                    with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                        for line_no, line in enumerate(f, 1):
                            for pattern in patterns:
                                if pattern.search(line):
                                    leaks.append(f"{filepath}:{line_no}")
    
    assert len(leaks) == 0, f"Potential secrets found in repository: {leaks}"

@pytest.mark.asyncio
async def test_cors_headers_present():
    """Verify that CORS middleware is configured."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.options("/health", headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "GET"
        })
        assert response.headers.get("access-control-allow-origin") in ["*", "http://localhost:5173"]
