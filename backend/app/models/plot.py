from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.db.base import Base


class PlotStatus(str, enum.Enum):
    available = "available"
    booked = "booked"
    agreement = "agreement"
    registration = "registration"


class Plot(Base):
    __tablename__ = "plots"

    id = Column(Integer, primary_key=True, index=True)
    plot_number = Column(String, unique=True, index=True)
    dimension = Column(String)
    area = Column(Float)
    status = Column(Enum(PlotStatus), default=PlotStatus.available)
    row = Column(Integer)
    col = Column(Integer)
    
    layout_id = Column(Integer, ForeignKey("layouts.id"))
    layout = relationship("Layout", back_populates="plots")
    
    bookings = relationship("Booking", back_populates="plot")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())