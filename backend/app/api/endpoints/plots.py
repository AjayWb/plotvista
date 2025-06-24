from typing import Any, List
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app.schemas.plot import Plot, PlotUpdate
from app.models.plot import PlotStatus

router = APIRouter()


@router.get("/", response_model=List[Plot])
async def read_plots(
    db: Session = Depends(deps.get_db),
    status: PlotStatus = None,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve plots. Returns mock data for MVP.
    """
    # In production, query from database with filters
    # For MVP, return empty list
    return []


@router.get("/{plot_id}", response_model=Plot)
async def read_plot(
    plot_id: int,
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Get plot by ID. Returns mock data for MVP.
    """
    return {
        "id": plot_id,
        "plot_number": str(plot_id),
        "dimension": "30×40",
        "area": 1200,
        "status": PlotStatus.available,
        "row": 0,
        "col": 0,
        "layout_id": 1,
        "created_at": datetime.now(),
        "updated_at": None
    }


@router.patch("/{plot_id}", response_model=Plot)
async def update_plot(
    plot_id: int,
    plot_in: PlotUpdate,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_manager),
) -> Any:
    """
    Update plot status. Requires manager role.
    """
    # In production, update in database
    # For MVP, return updated mock data
    return {
        "id": plot_id,
        "plot_number": str(plot_id),
        "dimension": "30×40",
        "area": 1200,
        "status": plot_in.status,
        "row": 0,
        "col": 0,
        "layout_id": 1,
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    }