from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

from .plot import Plot


class LayoutBase(BaseModel):
    name: str
    total_area: str
    total_plots: int


class LayoutCreate(LayoutBase):
    pass


class LayoutInDBBase(LayoutBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Layout(LayoutInDBBase):
    plots: List[Plot] = []


class LayoutInDB(LayoutInDBBase):
    pass