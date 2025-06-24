from fastapi import APIRouter

from app.api.endpoints import layouts, plots, bookings, auth, users

api_router = APIRouter()

# MVP endpoints - return mock data for now
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(layouts.router, prefix="/layouts", tags=["layouts"])
api_router.include_router(plots.router, prefix="/plots", tags=["plots"])
api_router.include_router(bookings.router, prefix="/bookings", tags=["bookings"])
api_router.include_router(users.router, prefix="/users", tags=["users"])