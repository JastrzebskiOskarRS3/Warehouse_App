from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/api/movements", tags=["movements"])

@router.get("/")
def get_movements(db: Session = Depends(get_db)):
    """Pobierz wszystkie ruchy magazynowe"""
    movements = db.query(models.StockMovement).order_by(desc(models.StockMovement.timestamp)).all()
    
    result = []
    for movement in movements:
        product = db.query(models.Product).filter(models.Product.id == movement.product_id).first()
        result.append({
            "id": movement.id,
            "product_id": movement.product_id,
            "product_name": product.name if product else "Nieznany produkt",
            "quantity": movement.quantity,
            "type": movement.type.value if hasattr(movement.type, 'value') else movement.type,
            "timestamp": movement.timestamp.strftime("%Y-%m-%d %H:%M:%S")
        })
    return result

@router.post("/")
def create_movement(movement: schemas.StockMovementCreate, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == movement.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Produkt nie istnieje")
    
    stock = db.query(models.WarehouseStock).filter(models.WarehouseStock.product_id == movement.product_id).first()
    if not stock:
        stock = models.WarehouseStock(product_id=movement.product_id, quantity=0)
        db.add(stock)
        db.commit()
        db.refresh(stock)
    
    if movement.type == schemas.MovementType.OUT and stock.quantity < movement.quantity:
        raise HTTPException(status_code=400, detail=f"Brak wystarczającej ilości w magazynie. Dostępne: {stock.quantity} szt.")
    
    new_movement = models.StockMovement(
        product_id=movement.product_id,
        quantity=movement.quantity,
        type=movement.type
    )
    db.add(new_movement)
    
    if movement.type == schemas.MovementType.IN:
        stock.quantity += movement.quantity
    else:
        stock.quantity -= movement.quantity
    
    db.commit()
    return {"message": "Ruch zarejestrowany", "new_quantity": stock.quantity}

@router.put("/{movement_id}")
def update_movement(movement_id: int, movement_update: schemas.StockMovementCreate, db: Session = Depends(get_db)):
    """Edytuj istniejący ruch magazynowy"""
    # Pobierz istniejący ruch
    old_movement = db.query(models.StockMovement).filter(models.StockMovement.id == movement_id).first()
    if not old_movement:
        raise HTTPException(status_code=404, detail="Ruch nie istnieje")
    
    product = db.query(models.Product).filter(models.Product.id == movement_update.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Produkt nie istnieje")
    
    # Pobierz stan magazynowy
    stock = db.query(models.WarehouseStock).filter(models.WarehouseStock.product_id == movement_update.product_id).first()
    if not stock:
        stock = models.WarehouseStock(product_id=movement_update.product_id, quantity=0)
        db.add(stock)
        db.commit()
        db.refresh(stock)
    
    # Cofnij stary ruch
    if old_movement.type.value == "przyjęcie":
        stock.quantity -= old_movement.quantity
    else:
        stock.quantity += old_movement.quantity
    
    # Sprawdź czy nowy ruch jest możliwy
    if movement_update.type == schemas.MovementType.OUT and stock.quantity < movement_update.quantity:
        # Przywróć stary stan
        if old_movement.type.value == "przyjęcie":
            stock.quantity += old_movement.quantity
        else:
            stock.quantity -= old_movement.quantity
        raise HTTPException(status_code=400, detail=f"Brak wystarczającej ilości w magazynie. Dostępne: {stock.quantity} szt.")
    
    # Aktualizuj ruch
    old_movement.product_id = movement_update.product_id
    old_movement.quantity = movement_update.quantity
    old_movement.type = movement_update.type
    
    # Zastosuj nowy ruch
    if movement_update.type == schemas.MovementType.IN:
        stock.quantity += movement_update.quantity
    else:
        stock.quantity -= movement_update.quantity
    
    db.commit()
    return {"message": "Ruch zaktualizowany", "new_quantity": stock.quantity}

@router.delete("/{movement_id}")
def delete_movement(movement_id: int, db: Session = Depends(get_db)):
    """Usuń ruch magazynowy i cofnij jego wpływ na stan magazynu"""
    movement = db.query(models.StockMovement).filter(models.StockMovement.id == movement_id).first()
    if not movement:
        raise HTTPException(status_code=404, detail="Ruch nie istnieje")
    
    # Pobierz stan magazynowy
    stock = db.query(models.WarehouseStock).filter(models.WarehouseStock.product_id == movement.product_id).first()
    
    if stock:
        # Cofnij ruch
        if movement.type.value == "przyjęcie":
            stock.quantity -= movement.quantity
        else:
            stock.quantity += movement.quantity
        
        if stock.quantity < 0:
            stock.quantity = 0
    
    # Usuń ruch
    db.delete(movement)
    db.commit()
    
    return {"message": "Ruch usunięty pomyślnie"}