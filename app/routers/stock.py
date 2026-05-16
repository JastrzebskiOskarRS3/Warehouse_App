from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import models

router = APIRouter(prefix="/api/stock", tags=["stock"])

@router.get("/")
def get_stock(db: Session = Depends(get_db)):
    stock = db.query(models.WarehouseStock).all()
    result = []
    for s in stock:
        product = db.query(models.Product).filter(models.Product.id == s.product_id).first()
        result.append({
            "product_id": s.product_id,
            "product_name": product.name if product else "Unknown",
            "quantity": s.quantity
        })
    return result