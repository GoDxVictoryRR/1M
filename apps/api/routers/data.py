from fastapi import APIRouter, HTTPException, Request

from apps.api.state import app_state
from packages.domain.ingestion.schema import IngestionResult, DatasetSummary

router = APIRouter(prefix="/api/data", tags=["data"])

@router.post("/demo", response_model=IngestionResult)
async def load_demo():
    """Loads the included deterministic demo operations dataset."""
    try:
        return app_state.load_demo_data()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load demo data: {str(e)}")

@router.post("/upload", response_model=IngestionResult)
async def upload_csv(request: Request):
    """
    Ingests and validates operational CSV data from either a multipart upload or text body.
    Returns granular validation summary and row errors if any exist.
    """
    content_type = request.headers.get("content-type", "")
    content = ""

    MAX_UPLOAD_BYTES = 10 * 1024 * 1024  # 10 MB limit

    if "multipart/form-data" in content_type:
        form = await request.form()
        uploaded_file = form.get("file")
        if not uploaded_file or not hasattr(uploaded_file, "read"):
            raise HTTPException(status_code=400, detail="Missing 'file' field in multipart form data")
        filename = getattr(uploaded_file, "filename", "")
        if filename and not filename.lower().endswith(".csv"):
            raise HTTPException(status_code=400, detail="Only .csv files are supported")
        byte_data = await uploaded_file.read()
        if len(byte_data) > MAX_UPLOAD_BYTES:
            raise HTTPException(status_code=413, detail="File exceeds maximum allowed size (10 MB)")
        content = byte_data.decode("utf-8", errors="replace")
    else:
        byte_data = await request.body()
        if len(byte_data) > MAX_UPLOAD_BYTES:
            raise HTTPException(status_code=413, detail="Payload exceeds maximum allowed size (10 MB)")
        content = byte_data.decode("utf-8", errors="replace")

    if not content or not content.strip():
        raise HTTPException(status_code=400, detail="Uploaded CSV content cannot be empty")

    try:
        result = app_state.validator.validate_csv(content)
        app_state.set_ingestion_result(result)
        return result
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal ingestion error: {str(e)}")


@router.get("/summary", response_model=DatasetSummary)
async def get_summary():
    """Returns metadata summary of the currently loaded dataset."""
    if app_state.summary is None:
        app_state.load_demo_data()
    return app_state.summary

@router.get("/records")
async def get_records(limit: int = 50):
    """Returns top normalized records."""
    records = app_state.get_or_load_records()
    return [r.model_dump() for r in records[:limit]]
