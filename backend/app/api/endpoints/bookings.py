from typing import Any, List
from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api import deps
from app.schemas.booking import Booking, BookingCreate

router = APIRouter()


@router.get("/", response_model=List[Booking])
async def read_bookings(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve bookings. Returns mock data for MVP.
    """
    return []


@router.post("/", response_model=Booking)
async def create_booking(
    booking_in: BookingCreate,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_manager),
) -> Any:
    """
    Create new booking. Requires manager role.
    """
    # In production, create in database
    # For MVP, return mock created booking
    return {
        "id": 1,
        "customer_name": booking_in.customer_name,
        "customer_phone": booking_in.customer_phone,
        "customer_email": booking_in.customer_email,
        "booking_type": booking_in.booking_type,
        "plot_id": booking_in.plot_id,
        "user_id": 1,
        "created_at": datetime.now(),
        "updated_at": None
    }