from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base import Base


class Layout(Base):
    __tablename__ = "layouts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    total_area = Column(String)
    total_plots = Column(Integer)
    
    plots = relationship("Plot", back_populates="layout")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())