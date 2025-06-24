from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.db.base import Base


class BookingType(str, enum.Enum):
    booking = "booking"
    agreement = "agreement"
    registration = "registration"


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String)
    customer_phone = Column(String)
    customer_email = Column(String)
    booking_type = Column(Enum(BookingType))
    
    plot_id = Column(Integer, ForeignKey("plots.id"))
    plot = relationship("Plot", back_populates="bookings")
    
    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User", back_populates="bookings")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())