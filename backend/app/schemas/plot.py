from typing import Optional
from datetime import datetime
from pydantic import BaseModel

from app.models.plot import PlotStatus


class PlotBase(BaseModel):
    plot_number: str
    dimension: str
    area: float
    status: PlotStatus = PlotStatus.available
    row: int
    col: int


class PlotCreate(PlotBase):
    layout_id: int


class PlotUpdate(BaseModel):
    status: Optional[PlotStatus] = None


class PlotInDBBase(PlotBase):
    id: int
    layout_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Plot(PlotInDBBase):
    pass


class PlotInDB(PlotInDBBase):
    pass