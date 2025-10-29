document.addEventListener('DOMContentLoaded', () => {
    // Elementos do DOM
    const navLinks = document.querySelectorAll('.nav-menu a');
    const sections = document.querySelectorAll('.section');

    const productForm = document.getElementById('product-form');
    const inventoryTable = document.querySelector('#inventory-table tbody');
    const saleProductSelect = document.getElementById('sale-product');
    const totalSalesSpan = document.getElementById('total-sales');
    const totalSalesHome = document.getElementById('total-sales-home');
    const netProfitHome = document.getElementById('net-profit-home');
    const totalProducts = document.getElementById('total-products');
    const salesTable = document.querySelector('#sales-table tbody');
    const totalAccumulated = document.getElementById('total-accumulated');
    const goalForm = document.getElementById('goal-form');
    const dailyGoalDisplay = document.getElementById('daily-goal-display');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');

    const addToCartBtn = document.getElementById('add-to-cart');
    const finalizeSaleBtn = document.getElementById('finalize-sale');
    const cartTable = document.querySelector('#cart-table tbody');
    const cartTotalSpan = document.getElementById('cart-total');
    const saleQuantityInput = document.getElementById('sale-quantity');

    // Dados do sistema
    let inventory = [];
    let totalSales = 0;
    let netProfit = 0;
    let salesHistory = [];
    let lastSaleDate = '';
    let dailyGoal = 0;
    let cart = [];

    // Carregar dados do localStorage
    try {
        inventory = JSON.parse(localStorage.getItem('inventory')) || [];
        totalSales = parseFloat(localStorage.getItem('totalSales')) || 0;
        netProfit = parseFloat(localStorage.getItem('netProfit')) || 0;
        salesHistory = JSON.parse(localStorage.getItem('salesHistory')) || [];
        lastSaleDate = localStorage.getItem('lastSaleDate') || new Date().toDateString();
        dailyGoal = parseFloat(localStorage.getItem('dailyGoal')) || 0;
    } catch (e) {
        console.warn('localStorage indisponível, usando dados em memória.');
    }

    // Reset diário
    const today = new Date().toDateString();
    if (lastSaleDate !== today) {
        totalSales = 0;
        netProfit = 0;
        lastSaleDate = today;
        saveData();
    }

    // Funções principais
    function saveData() {
        try {
            localStorage.setItem('inventory', JSON.stringify(inventory));
            localStorage.setItem('totalSales', totalSales.toString());
            localStorage.setItem('netProfit', netProfit.toString());
            localStorage.setItem('salesHistory', JSON.stringify(salesHistory));
            localStorage.setItem('lastSaleDate', lastSaleDate);
            localStorage.setItem('dailyGoal', dailyGoal.toString());
        } catch (e) {
            console.warn('Erro ao salvar no localStorage.');
        }
    }

    function updateProgress() {
        const progress = dailyGoal > 0 ? (totalSales / dailyGoal) * 100 : 0;
        progressFill.style.width = `${Math.min(progress, 100)}%`;
        progressText.textContent = `${progress.toFixed(1)}% da meta atingida`;
        if (progress >= 100) progressFill.style.background = '#d32f2f';
        else if (progress >= 75) progressFill.style.background = '#1976d2';
        else progressFill.style.background = '#4caf50';
    }

    function renderInventory() {
        inventory.sort((a, b) => a.name.localeCompare(b.name));
        inventoryTable.innerHTML = '';
        saleProductSelect.innerHTML = '<option value="">Selecione um produto</option>';

        inventory.forEach((product, index) => {
            const row = inventoryTable.insertRow();
            row.innerHTML = `
                <td>${product.name}</td>
                <td>${product.quantity}</td>
                <td>${product.price.toFixed(2)}</td>
                <td>${product.cost.toFixed(2)}</td>
                <td>${product.expiry}</td>
                <td><button class="remove-btn">Remover</button></td>
            `;
            row.querySelector('.remove-btn').addEventListener('click', () => removeProduct(index));

            const option = document.createElement('option');
            option.value = index;
            option.textContent = product.name;
            saleProductSelect.appendChild(option);
        });

        totalProducts.textContent = inventory.length;
        totalSalesHome.textContent = totalSales.toFixed(2);
        netProfitHome.textContent = netProfit.toFixed(2);
        dailyGoalDisplay.textContent = dailyGoal.toFixed(2);
        updateProgress();
        renderCart();
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
                <td>${sale.profit.toFixed(2)}</td>
            `;
            accumulated += sale.value;
        });
        totalAccumulated.textContent = accumulated.toFixed(2);
    }

    function removeProduct(index) {
        inventory.splice(index, 1);
        saveData();
        renderInventory();
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

    // Cadastro de produto
    productForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('product-name').value.trim();
        const quantity = parseFloat(document.getElementById('product-quantity').value);
        const price = parseFloat(document.getElementById('product-price').value);
        const cost = parseFloat(document.getElementById('product-cost').value);
        const expiry = document.getElementById('product-expiry').value;

        if (!name || quantity <= 0 || price <= 0 || cost < 0) {
            alert('Nome, quantidade, preço e custo devem ser válidos!');
            return;
        }

        const todayDate = new Date().toISOString().split('T')[0];
        if (expiry <= todayDate) {
            alert('Data de validade deve ser no futuro!');
            return;
        }

        inventory.push({ name, quantity, price, cost, expiry });
        saveData();
        renderInventory();
        productForm.reset();
        alert('Produto adicionado com sucesso!');
    });

    // Meta diária
    goalForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const goal = parseFloat(document.getElementById('daily-goal').value);
        if (goal <= 0) {
            alert('Meta deve ser maior que zero!');
            return;
        }
        dailyGoal = goal;
        saveData();
        renderInventory();
        goalForm.reset();
        alert('Meta definida com sucesso!');
    });

    // CARRINHO DE VENDAS
    function renderCart() {
        cartTable.innerHTML = '';
        let cartTotal = 0;

        cart.forEach((item, index) => {
            const row = cartTable.insertRow();
            row.innerHTML = `
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>${item.price.toFixed(2)}</td>
                <td>${(item.quantity * item.price).toFixed(2)}</td>
                <td><button class="remove-cart">Remover</button></td>
            `;
            row.querySelector('.remove-cart').addEventListener('click', () => {
                cart.splice(index, 1);
                renderCart();
            });
            cartTotal += item.quantity * item.price;
        });

        cartTotalSpan.textContent = cartTotal.toFixed(2);
    }

    addToCartBtn.addEventListener('click', () => {
        const index = parseInt(saleProductSelect.value);
        const quantity = parseFloat(saleQuantityInput.value);

        if (isNaN(index) || quantity <= 0) {
            alert('Selecione um produto e quantidade válida!');
            return;
        }

        if (inventory[index].quantity < quantity) {
            alert('Quantidade insuficiente em estoque!');
            return;
        }

        const existing = cart.find(item => item.name === inventory[index].name);
        if (existing) existing.quantity += quantity;
        else cart.push({
            name: inventory[index].name,
            quantity,
            price: inventory[index].price,
            cost: inventory[index].cost
        });

        renderCart();
        saleQuantityInput.value = '';
    });

    finalizeSaleBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            alert('Carrinho vazio!');
            return;
        }

        cart.forEach(item => {
            const index = inventory.findIndex(p => p.name === item.name);
            inventory[index].quantity -= item.quantity;

            const value = item.quantity * item.price;
            const profit = item.quantity * (item.price - item.cost);
            totalSales += value;
            netProfit += profit;

            salesHistory.push({
                date: new Date().toLocaleDateString(),
                product: item.name,
                quantity: item.quantity,
                value,
                profit
            });

            if (inventory[index].quantity <= 0) inventory.splice(index, 1);
        });

        cart = [];
        saveData();
        renderInventory();
        renderSalesHistory();
        alert('Venda finalizada com sucesso!');
    });

    // Inicialização
    renderInventory();
    renderSalesHistory();
    document.getElementById('home').classList.add('active');
    document.querySelector('[data-section="home"]').classList.add('active');

    const printReceiptBtn = document.getElementById('print-receipt');

printReceiptBtn.addEventListener('click', () => {
    if (cart.length === 0) {
        alert('Carrinho vazio! Nada para imprimir.');
        return;
    }

    let receiptContent = `
        <h2>Notinha de Venda</h2>
        <p>Data: ${new Date().toLocaleDateString()}</p>
        <table border="1" cellspacing="0" cellpadding="5">
            <thead>
                <tr>
                    <th>Produto</th>
                    <th>Quantidade (kg)</th>
                    <th>Preço/kg (R$)</th>
                    <th>Subtotal (R$)</th>
                </tr>
            </thead>
            <tbody>
    `;

    let total = 0;
    cart.forEach(item => {
        const subtotal = item.quantity * item.price;
        total += subtotal;
        receiptContent += `
            <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>${item.price.toFixed(2)}</td>
                <td>${subtotal.toFixed(2)}</td>
            </tr>
        `;
    });

    receiptContent += `
            </tbody>
        </table>
        <h3>Total: R$ ${total.toFixed(2)}</h3>
    `;

    const receiptWindow = window.open('', 'PRINT', 'height=600,width=400');
    receiptWindow.document.write('<html><head><title>Notinha</title></head><body>');
    receiptWindow.document.write(receiptContent);
    receiptWindow.document.write('</body></html>');
    receiptWindow.document.close();
    receiptWindow.focus();
    receiptWindow.print();
    receiptWindow.close();
});

});
