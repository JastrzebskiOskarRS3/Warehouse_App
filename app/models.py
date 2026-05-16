from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime
import enum

class MovementType(str, enum.Enum):
    IN = "przyjęcie"
    OUT = "wydanie"

class Supplier(Base):
    __tablename__ = "suppliers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    contact = Column(String, nullable=True)
    products = relationship("Product", back_populates="supplier")

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"))
    supplier = relationship("Supplier", back_populates="products")
    stocks = relationship("WarehouseStock", back_populates="product")
    movements = relationship("StockMovement", back_populates="product")

class WarehouseStock(Base):
    __tablename__ = "warehouse_stock"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), unique=True)
    quantity = Column(Integer, default=0)
    product = relationship("Product", back_populates="stocks")

class StockMovement(Base):
    __tablename__ = "stock_movements"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer, nullable=False)
    type = Column(Enum(MovementType))
    timestamp = Column(DateTime, default=datetime.utcnow)
    product = relationship("Product", back_populates="movements")