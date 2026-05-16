from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
from app.database import engine, Base, SessionLocal
from app.routers import products, suppliers, stock, movements
from app import models

app = FastAPI(title="Warehouse Management System")

# Montowanie plików statycznych
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# Tworzenie tabel
Base.metadata.create_all(bind=engine)

# Funkcja do dodawania początkowych danych
def seed_database():
    db = SessionLocal()
    try:
        # Sprawdź czy są już jacyś dostawcy
        if db.query(models.Supplier).count() == 0:
            print("📦 Dodawanie początkowych danych...")
            
            # Dodaj dostawców
            suppliers = [
                models.Supplier(name="Tech Distribution Sp. z o.o.", contact="kontakt@techdist.pl"),
                models.Supplier(name="Elektro Hurtownia", contact="zamowienia@elektro.pl"),
                models.Supplier(name="AGD Serwis", contact="biuro@agdserwis.pl"),
                models.Supplier(name="Meblex", contact="handel@meblex.pl"),
            ]
            for supplier in suppliers:
                db.add(supplier)
            db.commit()
            
            # Dodaj produkty
            products = [
                models.Product(name="Laptop Dell XPS", price=4500.00, supplier_id=1),
                models.Product(name="Myszek Logitech", price=120.00, supplier_id=1),
                models.Product(name="Klawiatura Mechaniczna", price=350.00, supplier_id=2),
                models.Product(name="Monitor 27 cali", price=1200.00, supplier_id=2),
                models.Product(name="Lodówka Samsung", price=2500.00, supplier_id=3),
                models.Product(name="Pralka Bosch", price=2200.00, supplier_id=3),
                models.Product(name="Biurko", price=800.00, supplier_id=4),
            ]
            for product in products:
                db.add(product)
            db.commit()
            
            # Dodaj stany magazynowe
            for product in products:
                stock_entry = models.WarehouseStock(product_id=product.id, quantity=10)
                db.add(stock_entry)
            db.commit()
            
            print("✅ Dane początkowe dodane pomyślnie!")
    finally:
        db.close()

# Uruchom seedowanie przy starcie
seed_database()

# Rejestracja routerów
app.include_router(products.router)
app.include_router(suppliers.router)
app.include_router(stock.router)
app.include_router(movements.router)

# Przekierowanie z głównej ścieżki do aplikacji
@app.get("/")
async def root():
    return RedirectResponse(url="/static/index.html")

# Opcjonalnie: zdrowie aplikacji
@app.get("/health")
async def health():
    return {"status": "OK", "message": "Warehouse App is running"}