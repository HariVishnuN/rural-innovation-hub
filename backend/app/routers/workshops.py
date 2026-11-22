from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.workshop import Workshop
from app.schemas.collaboration import WorkshopCreate, WorkshopResponse
from app.core.permissions import require_admin

router = APIRouter(prefix="/workshops", tags=["Makerspaces & Rural Workshops"])


@router.get("", response_model=List[WorkshopResponse])
def list_workshops(
    state: Optional[str] = Query(None, description="Filter by state"),
    type: Optional[str] = Query(None, description="FabLab, ToolLibrary, VillageWorkshop, PolytechnicMakerSpace"),
    db: Session = Depends(get_db),
):
    """Returns geographical makerspaces and tool-lending hubs across rural India."""
    query = db.query(Workshop).filter(Workshop.is_deleted == False)
    if state and state != "All":
        query = query.filter(Workshop.state.ilike(f"%{state.strip()}%"))
    if type and type != "All":
        query = query.filter(Workshop.type == type)

    workshops = query.all()
    return [
        WorkshopResponse(
            id=w.id,
            name=w.name,
            type=w.type,
            address=w.address,
            city_village=w.city_village,
            state=w.state,
            pincode=w.pincode,
            latitude=float(w.latitude),
            longitude=float(w.longitude),
            contact_phone=w.contact_phone,
            contact_email=w.contact_email,
            available_tools=w.available_tools,
            created_at=w.created_at,
        )
        for w in workshops
    ]


@router.post("", response_model=WorkshopResponse, status_code=status.HTTP_201_CREATED)
def create_workshop(
    req: WorkshopCreate,
    current_admin=Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Admin endpoint to register a verified rural makerspace."""
    w = Workshop(
        name=req.name,
        type=req.type,
        address=req.address,
        city_village=req.city_village,
        state=req.state,
        pincode=req.pincode,
        latitude=req.latitude,
        longitude=req.longitude,
        contact_phone=req.contact_phone,
        contact_email=req.contact_email,
        available_tools=req.available_tools,
    )
    db.add(w)
    db.commit()
    db.refresh(w)
    return WorkshopResponse(
        id=w.id,
        name=w.name,
        type=w.type,
        address=w.address,
        city_village=w.city_village,
        state=w.state,
        pincode=w.pincode,
        latitude=float(w.latitude),
        longitude=float(w.longitude),
        contact_phone=w.contact_phone,
        contact_email=w.contact_email,
        available_tools=w.available_tools,
        created_at=w.created_at,
    )
