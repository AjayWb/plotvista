from typing import Any, List
from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api import deps
from app.schemas.user import User

router = APIRouter()


@router.get("/me", response_model=User)
async def read_user_me(
    current_user = Depends(deps.get_current_user),
) -> Any:
    """
    Get current user.
    """
    return current_user


@router.get("/", response_model=List[User])
async def read_users(
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_manager),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve users. Requires manager role.
    """
    # In production, query from database
    # For MVP, return mock data
    return [{
        "id": 1,
        "username": "manager",
        "email": "manager@plotvista.com",
        "full_name": "Plot Manager",
        "role": "manager",
        "is_active": True,
        "created_at": datetime.now(),
        "updated_at": None
    }]