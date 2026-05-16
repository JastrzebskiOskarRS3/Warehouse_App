from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum

class MovementType(str, Enum):
    IN = "przyjęcie"
    OUT = "wydanie"

class ProductBase(BaseModel):
    name: str = Field(..., min_length=1)
    price: float = Field(..., gt=0)
    supplier_id: int

class ProductCreate(ProductBase):
    pass

class ProductResponse(ProductBase):
    id: int
    
    class Config:
        from_attributes = True

class SupplierBase(BaseModel):
    name: str = Field(..., min_length=1)
    contact: Optional[str] = None

class SupplierResponse(SupplierBase):
    id: int
    
    class Config:
        from_attributes = True

class StockMovementCreate(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0)
    type: MovementType