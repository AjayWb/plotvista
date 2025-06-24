from typing import Any, List
from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api import deps
from app.schemas.layout import Layout
from app.schemas.plot import Plot
from app.models.plot import PlotStatus

router = APIRouter()


def generate_mock_plots() -> List[Plot]:
    """Generate mock plot data for MVP"""
    plots = []
    for row in range(18):
        for col in range(20):
            plot_number = str(row * 20 + col + 1)
            dimension = "30×40" if (row + col) % 2 == 0 else "30×50"
            area = 1200 if dimension == "30×40" else 1500
            
            # Random status distribution
            status = PlotStatus.available
            if plot_number in ["10", "25", "67", "123", "234", "345"]:
                status = PlotStatus.registration
            elif plot_number in ["15", "30", "45", "89", "156", "267"]:
                status = PlotStatus.agreement
            elif plot_number in ["5", "20", "35", "50", "78", "99", "111", "222"]:
                status = PlotStatus.booked
            
            plots.append(Plot(
                id=int(plot_number),
                plot_number=plot_number,
                dimension=dimension,
                area=area,
                status=status,
                row=row,
                col=col,
                layout_id=1,
                created_at=datetime.now(),
                updated_at=None
            ))
    
    return plots


@router.get("/", response_model=List[Layout])
async def read_layouts(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve layouts. Returns mock data for MVP.
    """
    plots = generate_mock_plots()
    
    return [{
        "id": 1,
        "name": "Ruby Sizzle Heritage",
        "total_area": "22 acres",
        "total_plots": 360,
        "plots": plots,
        "created_at": datetime.now(),
        "updated_at": None
    }]


@router.get("/{layout_id}", response_model=Layout)
async def read_layout(
    layout_id: int,
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Get layout by ID. Returns mock data for MVP.
    """
    if layout_id != 1:
        return {"detail": "Layout not found"}
    
    plots = generate_mock_plots()
    
    return {
        "id": 1,
        "name": "Ruby Sizzle Heritage",
        "total_area": "22 acres",
        "total_plots": 360,
        "plots": plots,
        "created_at": datetime.now(),
        "updated_at": None
    }