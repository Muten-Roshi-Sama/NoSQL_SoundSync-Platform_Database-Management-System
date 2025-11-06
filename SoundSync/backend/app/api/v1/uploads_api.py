# backend/app/api/v1/uploads_api.py
from fastapi import APIRouter, UploadFile, File, HTTPException
from pathlib import Path
import uuid
import shutil

router = APIRouter()

# Directory inside your project where static files are served from
STATIC_AUDIO_DIR = Path(__file__).resolve().parents[2] / "static" / "audio"
STATIC_AUDIO_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_MIME = {"audio/mpeg", "audio/mp3"}
ALLOWED_EXT = {".mp3"}

@router.post("/upload/audio")
async def upload_audio(file: UploadFile = File(...)):
    """
    Accept an mp3 file and save it under static/audio with a unique filename.
    Returns JSON: { "url": "/static/audio/<filename>" }
    """
    # Basic validation
    content_type = file.content_type
    if content_type not in ALLOWED_MIME:
        raise HTTPException(status_code=400, detail="Invalid file type. Only mp3 allowed.")

    original_name = Path(file.filename).name
    ext = Path(original_name).suffix.lower()
    if ext not in ALLOWED_EXT:
        raise HTTPException(status_code=400, detail="Invalid extension. Only .mp3 allowed.")

    # create unique filename
    filename = f"{uuid.uuid4().hex}{ext}"
    dest = STATIC_AUDIO_DIR / filename

    try:
        # streaming save
        with dest.open("wb") as out_file:
            shutil.copyfileobj(file.file, out_file)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {e}")
    finally:
        await file.close()

    # Return the public URL (static mounted at /static)
    url = f"/static/audio/{filename}"
    return {"url": url, "filename": filename}


@router.delete("/upload/audio/delete/{filename}")
def delete_audio(filename: str):
    # prevent path traversal and enforce extension
    safe_name = Path(filename).name
    if Path(safe_name).suffix.lower() not in ALLOWED_EXT:
        raise HTTPException(status_code=400, detail="Invalid filename or extension")
    target = STATIC_AUDIO_DIR / safe_name
    if not target.exists():
        raise HTTPException(status_code=404, detail="File not found")
    try:
        target.unlink()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete: {e}")
    return {"deleted": True, "filename": safe_name}














