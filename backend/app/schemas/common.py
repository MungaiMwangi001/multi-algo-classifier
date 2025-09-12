"""Common Pydantic schemas used across the application."""

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class ErrorResponse(BaseModel):
    """Schema for error responses."""
    error: str = Field(..., description="Error type")
    message: str = Field(..., description="Error message")
    details: Optional[Dict[str, Any]] = Field(None, description="Additional error details")


class SuccessResponse(BaseModel):
    """Schema for success responses."""
    message: str = Field(..., description="Success message")
    data: Optional[Dict[str, Any]] = Field(None, description="Response data")


class PaginationParams(BaseModel):
    """Schema for pagination parameters."""
    page: int = Field(1, ge=1, description="Page number")
    size: int = Field(10, ge=1, le=100, description="Page size")


class PaginatedResponse(BaseModel):
    """Schema for paginated responses."""
    items: List[Any] = Field(..., description="List of items")
    total: int = Field(..., description="Total number of items")
    page: int = Field(..., description="Current page")
    size: int = Field(..., description="Page size")
    pages: int = Field(..., description="Total number of pages")


class HealthCheck(BaseModel):
    """Schema for health check response."""
    status: str = Field(..., description="Service status")
    version: str = Field(..., description="API version")
    timestamp: str = Field(..., description="Current timestamp")


class FileUploadResponse(BaseModel):
    """Schema for file upload response."""
    filename: str = Field(..., description="Uploaded filename")
    size: int = Field(..., description="File size in bytes")
    content_type: str = Field(..., description="File content type")
    message: str = Field(..., description="Upload status message")
