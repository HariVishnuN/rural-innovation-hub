import os
import uuid
import shutil
from fastapi import APIRouter, UploadFile, File, HTTPException, status

router = APIRouter(prefix="/upload", tags=["File Uploads"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = {
    ".png", ".jpg", ".jpeg", ".svg", ".webp", ".gif",
    ".pdf", ".mp4", ".mov", ".webm", ".avi", ".mkv"
}


@router.post("", status_code=status.HTTP_201_CREATED)
async def upload_file(file: UploadFile = File(...)):
    """Uploads a hardware prototype image, blueprint PDF/SVG, or working demo video."""
    ext = os.path.splitext(file.filename)[1].lower() if file.filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File extension '{ext}' not supported. Allowed: images (PNG, JPG, SVG, WebP), blueprints (PDF, SVG), videos (MP4, WebM)."
        )

    unique_filename = f"{uuid.uuid4().hex[:12]}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

    return {
        "url": f"/uploads/{unique_filename}",
        "filename": unique_filename,
        "original_name": file.filename,
        "content_type": file.content_type,
    }
