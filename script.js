document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-menu a');
    const sections = document.querySelectorAll('.section');
    const productForm = document.getElementById('product-form');
    const inventoryTable = document.querySelector('#inventory-table tbody');
    const saleForm = document.getElementById('sale-form');
    const saleProductSelect = document.getElementById('sale-product');
    const totalSalesSpan = document.getElementById('total-sales');
    const totalSalesHome = document.getElementById('total-sales-home');
    const totalProducts = document.getElementById('total-products');
    const salesTable = document.querySelector('#sales-table tbody');
    const totalAccumulated = document.getElementById('total-accumulated');
    
    let inventory = JSON.parse(localStorage.getItem('inventory')) || [];
    let totalSales = parseFloat(localStorage.getItem('totalSales')) || 0;
    let salesHistory = JSON.parse(localStorage.getItem('salesHistory')) || [];
    
    function saveData() {
        localStorage.setItem('inventory', JSON.stringify(inventory));
        localStorage.setItem('totalSales', totalSales.toString());
        localStorage.setItem('salesHistory', JSON.stringify(salesHistory));
    }
    
    function renderInventory() {
        inventoryTable.innerHTML = '';
        saleProductSelect.innerHTML = '<option value="">Selecione um produto</option>';
        inventory.forEach((product, index) => {
            const row = inventoryTable.insertRow();
            row.innerHTML = `
                <td>${product.name}</td>
                <td>${product.quantity}</td>
                <td>${product.price}</td>
                <td>${product.expiry}</td>
                <td><button onclick="removeProduct(${index})">Remover</button></td>
            `;
            const option = document.createElement('option');
            option.value = index;
            option.textContent = product.name;
            saleProductSelect.appendChild(option);
        });
        totalProducts.textContent = inventory.length;
        totalSalesHome.textContent = totalSales.toFixed(2);
    }
    
    function renderSalesHistory() {
        salesTable.innerHTML = '';
        let accumulated = 0;
        salesHistory.forEach(sale => {
            const row = salesTable.insertRow();
            row.innerHTML = `
                <td>${sale.date}</td>
                <td>${sale.product}</td>
                <td>${sale.quantity}</td>
                <td>${sale.value.toFixed(2)}</td>
            `;
            accumulated += sale.value;
        });
        totalAccumulated.textContent = accumulated.toFixed(2);
    }
    
    // Navegação
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('data-section');
            sections.forEach(section => section.classList.remove('active'));
            document.getElementById(sectionId).classList.add('active');
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
    
    productForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('product-name').value;
        const quantity = parseFloat(document.getElementById('product-quantity').value);
        const price = parseFloat(document.getElementById('product-price').value);
        const expiry = document.getElementById('product-expiry').value;
        
        inventory.push({ name, quantity, price, expiry });
        saveData();
        renderInventory();
        productForm.reset();
    });
    
    saleForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const index = parseInt(saleProductSelect.value);
        const quantity = parseFloat(document.getElementById('sale-quantity').value);
        
        if (inventory[index].quantity >= quantity) {
            inventory[index].quantity -= quantity;
            const value = quantity * inventory[index].price;
            totalSales += value;
            salesHistory.push({
                date: new Date().toLocaleDateString(),
                product: inventory[index].name,
                quantity,
                value
            });
            saveData();
            renderInventory();
            renderSalesHistory();
            saleForm.reset();
        } else {
            alert('Quantidade insuficiente em estoque!');
        }
    });
    
    window.removeProduct = (index) => {
        inventory.splice(index, 1);
        saveData();
        renderInventory();
    };
    
    renderInventory();
    renderSalesHistory();
    // Ativar Home por padrão
    document.getElementById('home').classList.add('active');
    document.querySelector('[data-section="home"]').classList.add('active');
});