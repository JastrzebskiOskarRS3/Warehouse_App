const API = '/api';
let allStockData = [];
let allMovementsData = [];
let currentMovementFilter = 'all';

// Pokaż wybraną zakładkę
function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.getElementById(`${tabName}-tab`).classList.add('active');
    event.target.classList.add('active');
    
    if (tabName === 'products') loadProducts();
    if (tabName === 'suppliers') loadSuppliers();
    if (tabName === 'stock') {
        loadStock();
        const searchInput = document.getElementById('stock-search');
        if (searchInput) searchInput.value = '';
    }
    if (tabName === 'movements') {
        loadMovements();
        loadProductsForMovement();
        const searchInput = document.getElementById('movement-search');
        if (searchInput) searchInput.value = '';
        currentMovementFilter = 'all';
        updateFilterButtons();
    }
}

function showMessage(elementId, message, type = 'success') {
    const msgDiv = document.getElementById(elementId);
    if (msgDiv) {
        msgDiv.textContent = message;
        msgDiv.className = `message ${type}`;
        msgDiv.style.display = 'block';
        setTimeout(() => {
            msgDiv.style.display = 'none';
        }, 3000);
    }
}

// ========== FILTRY RUCHÓW ==========
function filterMovementsByType(type) {
    currentMovementFilter = type;
    updateFilterButtons();
    filterMovements();
}

function updateFilterButtons() {
    const btnAll = document.getElementById('filter-all');
    const btnIn = document.getElementById('filter-in');
    const btnOut = document.getElementById('filter-out');
    
    if (btnAll) btnAll.classList.remove('active');
    if (btnIn) btnIn.classList.remove('active');
    if (btnOut) btnOut.classList.remove('active');
    
    if (currentMovementFilter === 'all') {
        if (btnAll) btnAll.classList.add('active');
    } else if (currentMovementFilter === 'przyjęcie') {
        if (btnIn) btnIn.classList.add('active');
    } else if (currentMovementFilter === 'wydanie') {
        if (btnOut) btnOut.classList.add('active');
    }
}

function filterMovements() {
    const searchTerm = document.getElementById('movement-search')?.value.toLowerCase().trim() || '';
    
    if (!allMovementsData || allMovementsData.length === 0) return;
    
    let filteredData = allMovementsData;
    
    // Filtruj po typie
    if (currentMovementFilter !== 'all') {
        filteredData = filteredData.filter(item => item.type === currentMovementFilter);
    }
    
    // Filtruj po wyszukiwaniu
    if (searchTerm !== '') {
        filteredData = filteredData.filter(item => 
            item.product_name.toLowerCase().includes(searchTerm) ||
            item.type.toLowerCase().includes(searchTerm) ||
            item.timestamp.includes(searchTerm)
        );
    }
    
    displayMovementsList(filteredData, searchTerm);
    updateMovementsCount(filteredData.length);
}

function clearMovementSearch() {
    const searchInput = document.getElementById('movement-search');
    if (searchInput) {
        searchInput.value = '';
        filterMovements();
        searchInput.focus();
    }
}

function updateMovementsCount(count) {
    const movementsCount = document.getElementById('movements-count');
    if (movementsCount) {
        if (currentMovementFilter !== 'all') {
            const filterText = currentMovementFilter === 'przyjęcie' ? 'przyjęć' : 'wydań';
            movementsCount.textContent = `📊 Znaleziono ${count} ${filterText}`;
        } else {
            movementsCount.textContent = `📊 Łącznie: ${count} ruchów`;
        }
    }
}

// ========== STATYSTYKI ==========
function updateStatistics() {
    if (!allMovementsData || allMovementsData.length === 0) {
        document.getElementById('total-in').textContent = '0';
        document.getElementById('total-out').textContent = '0';
        document.getElementById('total-movements').textContent = '0';
        return;
    }
    
    const totalIn = allMovementsData.filter(m => m.type === 'przyjęcie').length;
    const totalOut = allMovementsData.filter(m => m.type === 'wydanie').length;
    
    document.getElementById('total-in').textContent = totalIn;
    document.getElementById('total-out').textContent = totalOut;
    document.getElementById('total-movements').textContent = allMovementsData.length;
}

// ========== WYSZUKIWANIE W STANIE MAGAZYNU ==========
function filterStock() {
    const searchTerm = document.getElementById('stock-search').value.toLowerCase().trim();
    
    if (!allStockData || allStockData.length === 0) return;
    
    const filteredData = allStockData.filter(item => 
        item.product_name.toLowerCase().includes(searchTerm)
    );
    
    displayStockList(filteredData, searchTerm);
    
    const stockCount = document.getElementById('stock-count');
    if (stockCount) {
        if (searchTerm === '') {
            stockCount.textContent = `📊 Łącznie: ${filteredData.length} produktów`;
        } else {
            stockCount.textContent = `🔍 Znaleziono: ${filteredData.length} z ${allStockData.length} produktów`;
        }
    }
}

function clearSearch() {
    const searchInput = document.getElementById('stock-search');
    if (searchInput) {
        searchInput.value = '';
        filterStock();
        searchInput.focus();
    }
}

function displayStockList(stock, searchTerm = '') {
    const listDiv = document.getElementById('stock-list');
    if (!listDiv) return;
    
    listDiv.innerHTML = '';
    
    if (stock.length === 0) {
        listDiv.innerHTML = '<div class="data-item">❌ Nie znaleziono produktów</div>';
        return;
    }
    
    stock.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'data-item';
        
        let productName = item.product_name;
        if (searchTerm && searchTerm !== '') {
            const regex = new RegExp(`(${searchTerm})`, 'gi');
            productName = productName.replace(regex, '<mark>$1</mark>');
        }
        
        itemDiv.innerHTML = `
            <div class="data-info">
                <strong>${productName}</strong><br>
                Ilość: ${item.quantity} szt.
            </div>
        `;
        
        if (searchTerm && searchTerm !== '' && 
            item.product_name.toLowerCase().includes(searchTerm.toLowerCase())) {
            itemDiv.classList.add('highlight');
            if (index === 0) {
                setTimeout(() => {
                    itemDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);
            }
        }
        
        listDiv.appendChild(itemDiv);
    });
}

function displayMovementsList(movements, searchTerm = '') {
    const listDiv = document.getElementById('movements-list');
    if (!listDiv) return;
    
    listDiv.innerHTML = '';
    
    if (movements.length === 0) {
        listDiv.innerHTML = '<div class="data-item">❌ Brak ruchów magazynowych</div>';
        return;
    }
    
    movements.forEach((movement, index) => {
        const itemDiv = document.createElement('div');
        const isIn = movement.type === 'przyjęcie';
        itemDiv.className = `movement-item ${isIn ? 'movement-in' : 'movement-out'}`;
        
        let productName = movement.product_name;
        let typeText = isIn ? 'PRZYJĘCIE' : 'WYDANIE';
        let typeClass = isIn ? 'in' : 'out';
        
        if (searchTerm && searchTerm !== '') {
            const regex = new RegExp(`(${searchTerm})`, 'gi');
            productName = productName.replace(regex, '<mark>$1</mark>');
            typeText = typeText.replace(regex, '<mark>$1</mark>');
        }
        
        itemDiv.innerHTML = `
            <div class="movement-product">📦 ${productName}</div>
            <div>
                <span class="movement-type ${typeClass}">${isIn ? '📥' : '📤'} ${typeText}</span>
                <span class="movement-quantity">Ilość: ${movement.quantity} szt.</span>
            </div>
            <div class="movement-date">📅 ${movement.timestamp}</div>
            <div class="movement-actions">
                <button class="edit-movement-btn" onclick="openMovementModal(${movement.id}, ${movement.product_id}, '${movement.product_name.replace(/'/g, "\\'")}', ${movement.quantity}, '${movement.type}')">✏️ Edytuj</button>
                <button class="delete-movement-btn" onclick="deleteMovement(${movement.id})">🗑️ Usuń</button>
            </div>
        `;
        
        if (searchTerm && searchTerm !== '' && 
            (movement.product_name.toLowerCase().includes(searchTerm) ||
             movement.type.toLowerCase().includes(searchTerm))) {
            itemDiv.classList.add('highlight');
            if (index === 0) {
                setTimeout(() => {
                    itemDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);
            }
        }
        
        listDiv.appendChild(itemDiv);
    });
}
    

// ========== MODALE ==========
function openProductModal(productId, productName, productPrice, supplierId) {
    document.getElementById('edit-product-id').value = productId;
    document.getElementById('edit-product-name').value = productName;
    document.getElementById('edit-product-price').value = productPrice;
    document.getElementById('edit-product-supplier').value = supplierId;
    document.getElementById('editProductModal').style.display = 'block';
}

function closeProductModal() {
    document.getElementById('editProductModal').style.display = 'none';
}

function openSupplierModal(supplierId, supplierName, supplierContact) {
    document.getElementById('edit-supplier-id').value = supplierId;
    document.getElementById('edit-supplier-name').value = supplierName;
    document.getElementById('edit-supplier-contact').value = supplierContact || '';
    document.getElementById('editSupplierModal').style.display = 'block';
}

function closeSupplierModal() {
    document.getElementById('editSupplierModal').style.display = 'none';
}

window.onclick = function(event) {
    const productModal = document.getElementById('editProductModal');
    const supplierModal = document.getElementById('editSupplierModal');
    if (event.target == productModal) productModal.style.display = 'none';
    if (event.target == supplierModal) supplierModal.style.display = 'none';
}

// ========== PRODUKTY ==========
async function loadProducts() {
    try {
        const response = await fetch(`${API}/products`);
        const products = await response.json();
        
        const listDiv = document.getElementById('product-list');
        if (!listDiv) return;
        
        listDiv.innerHTML = '';
        
        if (products.length === 0) {
            listDiv.innerHTML = '<div class="data-item">Brak produktów. Dodaj pierwszy produkt!</div>';
            return;
        }
        
        for (const product of products) {
            const supplierResponse = await fetch(`${API}/suppliers/${product.supplier_id}`);
            const supplier = await supplierResponse.json();
            
            const itemDiv = document.createElement('div');
            itemDiv.className = 'data-item';
            itemDiv.innerHTML = `
                <div class="data-info">
                    <strong>${product.name}</strong><br>
                    Cena: ${product.price.toFixed(2)} zł | Dostawca: ${supplier.name}
                </div>
                <div class="data-actions">
                    <button class="edit-btn" onclick="editProduct(${product.id}, '${product.name.replace(/'/g, "\\'")}', ${product.price}, ${product.supplier_id})">✏️ Edytuj</button>
                    <button class="delete-btn" onclick="deleteProduct(${product.id})">🗑️ Usuń</button>
                </div>
            `;
            listDiv.appendChild(itemDiv);
        }
    } catch (error) {
        console.error('Błąd ładowania produktów:', error);
    }
}

function editProduct(id, name, price, supplierId) {
    openProductModal(id, name, price, supplierId);
}

async function saveProductEdit() {
    const id = document.getElementById('edit-product-id').value;
    const name = document.getElementById('edit-product-name').value;
    const price = parseFloat(document.getElementById('edit-product-price').value);
    const supplier_id = parseInt(document.getElementById('edit-product-supplier').value);
    
    if (!name || !price || !supplier_id) {
        alert('Wypełnij wszystkie pola!');
        return;
    }
    
    if (isNaN(price) || price <= 0) {
        alert('Podaj poprawną cenę!');
        return;
    }
    
    try {
        const response = await fetch(`${API}/products/${id}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({name, price, supplier_id})
        });
        
        if (response.ok) {
            closeProductModal();
            await loadProducts();
            await loadStock();
            await loadSuppliers();
            showMessage('movement-result', '✅ Produkt zaktualizowany!', 'success');
        } else {
            const error = await response.json();
            showMessage('movement-result', `❌ Błąd: ${error.detail}`, 'error');
        }
    } catch (error) {
        showMessage('movement-result', '❌ Błąd podczas edycji', 'error');
    }
}

async function createProduct() {
    const name = document.getElementById('prod-name')?.value;
    const price = parseFloat(document.getElementById('prod-price')?.value);
    const supplier_id = parseInt(document.getElementById('prod-supplier')?.value);
    
    if (!name || !price || !supplier_id) {
        alert('Wypełnij wszystkie pola!');
        return;
    }
    
    if (isNaN(price) || price <= 0) {
        alert('Podaj poprawną cenę!');
        return;
    }
    
    try {
        const response = await fetch(`${API}/products`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({name, price, supplier_id})
        });
        
        if (response.ok) {
            document.getElementById('prod-name').value = '';
            document.getElementById('prod-price').value = '';
            await loadProducts();
            await loadStock();
            await loadSuppliers();
            showMessage('movement-result', '✅ Produkt dodany pomyślnie!', 'success');
        } else {
            const error = await response.json();
            showMessage('movement-result', `❌ Błąd: ${error.detail}`, 'error');
        }
    } catch (error) {
        showMessage('movement-result', '❌ Błąd podczas dodawania produktu', 'error');
    }
}

async function deleteProduct(id) {
    if (confirm('Czy na pewno chcesz usunąć ten produkt?')) {
        try {
            const response = await fetch(`${API}/products/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                await loadProducts();
                await loadStock();
                await loadSuppliers();
                showMessage('movement-result', '✅ Produkt usunięty!', 'success');
            } else {
                const error = await response.json();
                showMessage('movement-result', `❌ Błąd: ${error.detail}`, 'error');
            }
        } catch (error) {
            showMessage('movement-result', '❌ Błąd podczas usuwania', 'error');
        }
    }
}

// ========== DOSTAWCY ==========
async function loadSuppliers() {
    try {
        const response = await fetch(`${API}/suppliers`);
        const suppliers = await response.json();
        
        const listDiv = document.getElementById('supplier-list');
        if (listDiv) {
            listDiv.innerHTML = '';
            
            if (suppliers.length === 0) {
                listDiv.innerHTML = '<div class="data-item">Brak dostawców. Dodaj pierwszego dostawcę!</div>';
            } else {
                suppliers.forEach(supplier => {
                    const itemDiv = document.createElement('div');
                    itemDiv.className = 'data-item';
                    itemDiv.innerHTML = `
                        <div class="data-info">
                            <strong>${supplier.name}</strong><br>
                            Kontakt: ${supplier.contact || 'Brak kontaktu'}
                        </div>
                        <div class="data-actions">
                            <button class="edit-btn" onclick="editSupplier(${supplier.id}, '${supplier.name.replace(/'/g, "\\'")}', '${(supplier.contact || '').replace(/'/g, "\\'")}')">✏️ Edytuj</button>
                            <button class="delete-btn" onclick="deleteSupplier(${supplier.id})">🗑️ Usuń</button>
                        </div>
                    `;
                    listDiv.appendChild(itemDiv);
                });
            }
        }
        
        const prodSelect = document.getElementById('prod-supplier');
        if (prodSelect) {
            if (suppliers.length === 0) {
                prodSelect.innerHTML = '<option value="">Najpierw dodaj dostawcę!</option>';
            } else {
                prodSelect.innerHTML = suppliers.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
            }
        }
        
        const editSupplierSelect = document.getElementById('edit-product-supplier');
        if (editSupplierSelect) {
            editSupplierSelect.innerHTML = suppliers.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
        }
        
    } catch (error) {
        console.error('Błąd ładowania dostawców:', error);
    }
}

function editSupplier(id, name, contact) {
    openSupplierModal(id, name, contact);
}

async function saveSupplierEdit() {
    const id = document.getElementById('edit-supplier-id').value;
    const name = document.getElementById('edit-supplier-name').value;
    const contact = document.getElementById('edit-supplier-contact').value;
    
    if (!name) {
        alert('Podaj nazwę dostawcy!');
        return;
    }
    
    try {
        const response = await fetch(`${API}/suppliers/${id}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({name, contact})
        });
        
        if (response.ok) {
            closeSupplierModal();
            await loadSuppliers();
            await loadProducts();
            showMessage('movement-result', '✅ Dostawca zaktualizowany!', 'success');
        } else {
            const error = await response.json();
            showMessage('movement-result', `❌ Błąd: ${error.detail}`, 'error');
        }
    } catch (error) {
        showMessage('movement-result', '❌ Błąd podczas edycji dostawcy', 'error');
    }
}

async function createSupplier() {
    const name = document.getElementById('supp-name')?.value;
    const contact = document.getElementById('supp-contact')?.value;
    
    if (!name) {
        alert('Podaj nazwę dostawcy!');
        return;
    }
    
    try {
        const response = await fetch(`${API}/suppliers`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({name, contact: contact || ''})
        });
        
        if (response.ok) {
            document.getElementById('supp-name').value = '';
            document.getElementById('supp-contact').value = '';
            await loadSuppliers();
            await loadProducts();
            showMessage('movement-result', '✅ Dostawca dodany!', 'success');
        } else {
            const error = await response.json();
            showMessage('movement-result', `❌ Błąd: ${error.detail}`, 'error');
        }
    } catch (error) {
        showMessage('movement-result', '❌ Błąd podczas dodawania dostawcy', 'error');
    }
}

async function deleteSupplier(id) {
    const productsResponse = await fetch(`${API}/products`);
    const products = await productsResponse.json();
    const hasProducts = products.some(p => p.supplier_id === id);
    
    if (hasProducts) {
        alert('❌ Nie można usunąć dostawcy, który ma przypisane produkty! Najpierw usuń produkty tego dostawcy.');
        return;
    }
    
    if (confirm('Czy na pewno chcesz usunąć tego dostawcę?')) {
        try {
            const response = await fetch(`${API}/suppliers/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                await loadSuppliers();
                await loadProducts();
                showMessage('movement-result', '✅ Dostawca usunięty!', 'success');
            } else {
                const error = await response.json();
                showMessage('movement-result', `❌ Błąd: ${error.detail}`, 'error');
            }
        } catch (error) {
            showMessage('movement-result', '❌ Błąd podczas usuwania dostawcy', 'error');
        }
    }
}

// ========== STAN MAGAZYNU ==========
async function loadStock() {
    try {
        const response = await fetch(`${API}/stock`);
        allStockData = await response.json();
        
        const searchTerm = document.getElementById('stock-search')?.value || '';
        
        if (searchTerm === '') {
            displayStockList(allStockData, '');
            const stockCount = document.getElementById('stock-count');
            if (stockCount) {
                stockCount.textContent = `📊 Łącznie: ${allStockData.length} produktów`;
            }
        } else {
            filterStock();
        }
    } catch (error) {
        console.error('Błąd ładowania stanu magazynu:', error);
    }
}

// ========== RUCHY MAGAZYNOWE ==========
async function loadMovements() {
    try {
        const response = await fetch(`${API}/movements`);
        allMovementsData = await response.json();
        
        updateStatistics();
        
        const searchTerm = document.getElementById('movement-search')?.value || '';
        
        if (searchTerm === '') {
            filterMovements();
        } else {
            filterMovements();
        }
    } catch (error) {
        console.error('Błąd ładowania historii ruchów:', error);
    }
}

async function loadProductsForMovement() {
    try {
        const response = await fetch(`${API}/products`);
        const products = await response.json();
        const movSelect = document.getElementById('mov-product');
        if (movSelect) {
            if (products.length === 0) {
                movSelect.innerHTML = '<option value="">Najpierw dodaj produkt!</option>';
            } else {
                movSelect.innerHTML = '<option value="">Wybierz produkt</option>' + 
                    products.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
            }
        }
    } catch (error) {
        console.error('Błąd ładowania produktów dla ruchu:', error);
    }
}

async function recordMovement() {
    const product_id = parseInt(document.getElementById('mov-product')?.value);
    const quantity = parseInt(document.getElementById('mov-qty')?.value);
    const type = document.getElementById('mov-type')?.value;
    
    if (!product_id) {
        alert('Wybierz produkt!');
        return;
    }
    
    if (!quantity || quantity <= 0) {
        alert('Podaj poprawną ilość (większą niż 0)!');
        return;
    }
    
    try {
        const response = await fetch(`${API}/movements`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({product_id, quantity, type})
        });
        
        const result = await response.json();
        
        if (response.ok) {
            document.getElementById('mov-qty').value = '';
            document.getElementById('mov-product').value = '';
            await loadStock();
            await loadMovements();
            const message = type === 'przyjęcie' 
                ? `✅ Przyjęto ${quantity} szt. do magazynu! Nowy stan: ${result.new_quantity} szt.` 
                : `✅ Wydano ${quantity} szt. z magazynu! Pozostało: ${result.new_quantity} szt.`;
            showMessage('movement-result', message, 'success');
        } else {
            showMessage('movement-result', `❌ Błąd: ${result.detail}`, 'error');
        }
    } catch (error) {
        showMessage('movement-result', '❌ Błąd podczas rejestrowania ruchu', 'error');
    }
}
// ========== EDYCJA RUCHÓW MAGAZYNOWYCH ==========
let currentEditMovementId = null;

function openMovementModal(movementId, productId, productName, quantity, type) {
    currentEditMovementId = movementId;
    document.getElementById('edit-movement-id').value = movementId;
    document.getElementById('edit-movement-quantity').value = quantity;
    document.getElementById('edit-movement-type').value = type;
    
    // Załaduj produkty do selecta
    loadProductsForMovementSelect('edit-movement-product', productId);
    
    document.getElementById('editMovementModal').style.display = 'block';
}

function closeMovementModal() {
    document.getElementById('editMovementModal').style.display = 'none';
    currentEditMovementId = null;
}

async function loadProductsForMovementSelect(selectId, selectedProductId) {
    try {
        const response = await fetch(`${API}/products`);
        const products = await response.json();
        const select = document.getElementById(selectId);
        if (select) {
            select.innerHTML = '<option value="">Wybierz produkt</option>' + 
                products.map(p => `<option value="${p.id}" ${p.id === selectedProductId ? 'selected' : ''}>${p.name}</option>`).join('');
        }
    } catch (error) {
        console.error('Błąd ładowania produktów:', error);
    }
}

async function saveMovementEdit() {
    const movementId = document.getElementById('edit-movement-id').value;
    const product_id = parseInt(document.getElementById('edit-movement-product').value);
    const quantity = parseInt(document.getElementById('edit-movement-quantity').value);
    const type = document.getElementById('edit-movement-type').value;
    
    if (!product_id) {
        alert('Wybierz produkt!');
        return;
    }
    
    if (!quantity || quantity <= 0) {
        alert('Podaj poprawną ilość (większą niż 0)!');
        return;
    }
    
    try {
        const response = await fetch(`${API}/movements/${movementId}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({product_id, quantity, type})
        });
        
        const result = await response.json();
        
        if (response.ok) {
            closeMovementModal();
            await loadStock();
            await loadMovements();
            showMessage('movement-result', '✅ Ruch zaktualizowany pomyślnie!', 'success');
        } else {
            showMessage('movement-result', `❌ Błąd: ${result.detail}`, 'error');
        }
    } catch (error) {
        showMessage('movement-result', '❌ Błąd podczas edycji ruchu', 'error');
    }
}

async function deleteMovement(movementId) {
    if (confirm('Czy na pewno chcesz usunąć ten ruch? Spowoduje to cofnięcie zmian w stanie magazynu!')) {
        try {
            const response = await fetch(`${API}/movements/${movementId}`, {
                method: 'DELETE'
            });
            
            const result = await response.json();
            
            if (response.ok) {
                await loadStock();
                await loadMovements();
                showMessage('movement-result', '✅ Ruch usunięty pomyślnie!', 'success');
            } else {
                showMessage('movement-result', `❌ Błąd: ${result.detail}`, 'error');
            }
        } catch (error) {
            showMessage('movement-result', '❌ Błąd podczas usuwania ruchu', 'error');
        }
    }
}

// ========== INICJALIZACJA ==========
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Aplikacja startuje...');
    await loadSuppliers();
    await loadProducts();
    await loadStock();
    await loadMovements();
    console.log('✅ Aplikacja gotowa!');
});