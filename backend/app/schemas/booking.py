from typing import Optional
from datetime import datetime
from pydantic import BaseModel

from app.models.booking import BookingType


class BookingBase(BaseModel):
    customer_name: str
    customer_phone: str
    customer_email: Optional[str] = None
    booking_type: BookingType


class BookingCreate(BookingBase):
    plot_id: int


class BookingInDBBase(BookingBase):
    id: int
    plot_id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Booking(BookingInDBBase):
    pass


class BookingInDB(BookingInDBBase):
    pass