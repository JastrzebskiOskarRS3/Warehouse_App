from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/api/suppliers", tags=["suppliers"])

@router.get("/", response_model=list[schemas.SupplierResponse])
def get_suppliers(db: Session = Depends(get_db)):
    return db.query(models.Supplier).all()

@router.get("/{supplier_id}", response_model=schemas.SupplierResponse)
def get_supplier(supplier_id: int, db: Session = Depends(get_db)):
    supplier = db.query(models.Supplier).filter(models.Supplier.id == supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return supplier

@router.post("/", response_model=schemas.SupplierResponse, status_code=status.HTTP_201_CREATED)
def create_supplier(supplier: schemas.SupplierBase, db: Session = Depends(get_db)):
    # Sprawdź czy dostawca już istnieje
    existing = db.query(models.Supplier).filter(models.Supplier.name == supplier.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Dostawca już istnieje")
    
    db_supplier = models.Supplier(**supplier.model_dump())
    db.add(db_supplier)
    db.commit()
    db.refresh(db_supplier)
    return db_supplier

@router.put("/{supplier_id}", response_model=schemas.SupplierResponse)
def update_supplier(supplier_id: int, supplier: schemas.SupplierBase, db: Session = Depends(get_db)):
    db_supplier = db.query(models.Supplier).filter(models.Supplier.id == supplier_id).first()
    if not db_supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    # Sprawdź czy nowa nazwa nie koliduje z innym dostawcą
    existing = db.query(models.Supplier).filter(
        models.Supplier.name == supplier.name, 
        models.Supplier.id != supplier_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Dostawca o tej nazwie już istnieje")
    
    for key, value in supplier.model_dump().items():
        setattr(db_supplier, key, value)
    
    db.commit()
    db.refresh(db_supplier)
    return db_supplier

@router.delete("/{supplier_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_supplier(supplier_id: int, db: Session = Depends(get_db)):
    supplier = db.query(models.Supplier).filter(models.Supplier.id == supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    # Sprawdź czy dostawca ma produkty
    products = db.query(models.Product).filter(models.Product.supplier_id == supplier_id).first()
    if products:
        raise HTTPException(status_code=400, detail="Nie można usunąć dostawcy posiadającego produkty. Najpierw usuń produkty tego dostawcy.")
    
    db.delete(supplier)
    db.commit()
    return None