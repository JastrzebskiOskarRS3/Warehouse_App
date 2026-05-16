# System Zarządzania Magazynem

Aplikacja webowa do zarządzania stanem magazynowym — backend w **FastAPI (Python)**, frontend w **JavaScript/HTML/CSS**.

## Funkcjonalności

- **Zarządzanie produktami** — dodawanie, edycja i usuwanie produktów z przypisaniem ceny i dostawcy
- **Zarządzanie dostawcami** — baza dostawców z danymi kontaktowymi; dostawcy z przypisanymi produktami są chronieni przed przypadkowym usunięciem
- **Stan magazynowy** — aktualne stany ilościowe aktualizowane automatycznie po każdym ruchu; wyszukiwarka produktów w czasie rzeczywistym
- **Ruchy magazynowe** — rejestrowanie przyjęć i wydań z magazynu; pełna historia z możliwością edycji i usuwania wpisów (stan magazynu przeliczany automatycznie)
- **Historia ruchów** — filtrowanie po typie ruchu (przyjęcia/wydania) i wyszukiwanie tekstowe
- **Statystyki** — karty podsumowujące łączną liczbę przyjęć, wydań i wszystkich ruchów
- **Dane startowe** — aplikacja przy pierwszym uruchomieniu automatycznie wypełnia bazę przykładowymi dostawcami i produktami

## Technologie

### Backend
- **FastAPI** — framework REST API
- **SQLAlchemy** — ORM do obsługi bazy danych
- **SQLite** — lekka baza danych (plik `warehouse.db`, tworzony automatycznie)
- **Pydantic** — walidacja danych wejściowych

### Frontend
- **HTML5 / CSS3** — struktura i stylizacja
- **JavaScript (ES6)** — logika aplikacji, komunikacja z API przez `fetch`

## Struktura projektu

```
warehouse_app/
├── app/
│   ├── routers/
│   │   ├── products.py      # Endpointy produktów (CRUD)
│   │   ├── suppliers.py     # Endpointy dostawców (CRUD)
│   │   ├── stock.py         # Endpointy stanu magazynowego
│   │   └── movements.py     # Endpointy ruchów magazynowych (CRUD)
│   ├── static/
│   │   ├── index.html       # Interfejs użytkownika
│   │   ├── app.js           # Logika frontendowa
│   │   └── style.css        # Style CSS
│   ├── database.py          # Konfiguracja bazy danych i sesji
│   ├── models.py            # Modele SQLAlchemy (tabele)
│   └── schemas.py           # Schematy Pydantic (walidacja)
└── main.py                  # Główna aplikacja, rejestracja routerów, seedowanie
```

## Instalacja i uruchomienie

### Wymagania
- Python 3.8+
- pip

### Kroki

1. **Sklonuj repozytorium**
```bash
git clone https://github.com/JastrzebskiOskarRS3/Warehouse_App.git
cd Warehouse_App
```

2. **Utwórz i aktywuj wirtualne środowisko**
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux / Mac
python -m venv venv
source venv/bin/activate
```

3. **Zainstaluj zależności**
```bash
pip install fastapi uvicorn sqlalchemy pydantic
```

4. **Uruchom aplikację**
```bash
uvicorn main:app --reload
```

5. **Otwórz w przeglądarce**
```
http://localhost:8000
```

Baza danych (`warehouse.db`) oraz przykładowe dane tworzą się automatycznie przy pierwszym uruchomieniu.

## API

Interaktywna dokumentacja API dostępna po uruchomieniu pod adresem:
```
http://localhost:8000/docs
```

Główne endpointy:

| Metoda | Ścieżka | Opis |
|--------|---------|------|
| GET | `/api/products` | Lista produktów |
| POST | `/api/products` | Dodaj produkt |
| PUT | `/api/products/{id}` | Edytuj produkt |
| DELETE | `/api/products/{id}` | Usuń produkt |
| GET | `/api/suppliers` | Lista dostawców |
| POST | `/api/suppliers` | Dodaj dostawcę |
| PUT | `/api/suppliers/{id}` | Edytuj dostawcę |
| DELETE | `/api/suppliers/{id}` | Usuń dostawcę |
| GET | `/api/stock` | Stan magazynowy |
| GET | `/api/movements` | Historia ruchów |
| POST | `/api/movements` | Zarejestruj ruch |
| PUT | `/api/movements/{id}` | Edytuj ruch |
| DELETE | `/api/movements/{id}` | Usuń ruch |
