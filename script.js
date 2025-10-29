document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-menu a');
    const sections = document.querySelectorAll('.section');
    const productForm = document.getElementById('product-form');
    const inventoryTable = document.querySelector('#inventory-table tbody');
    const saleForm = document.getElementById('sale-form');
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
    
    let inventory = [];
    let totalSales = 0;
    let netProfit = 0;
    let salesHistory = [];
    let lastSaleDate = '';
    let dailyGoal = 0;
    
    // Carregar dados com tratamento de erro
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
    
    // Reset de vendas diárias
    const today = new Date().toDateString();
    if (lastSaleDate !== today) {
        totalSales = 0;
        netProfit = 0;
        lastSaleDate = today;
        saveData();
    }
    
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
        if (progress >= 100) {
            progressFill.style.background = '#d32f2f'; // Vermelho quando atingida
            alert('Parabéns! Meta diária atingida!');
        } else if (progress >= 75) {
            progressFill.style.background = '#1976d2'; // Azul quando próxima
        } else {
            progressFill.style.background = '#4caf50'; // Verde quando baixa
        }
    }
    
    function renderInventory() {
        // Ordenar produtos alfabeticamente por nome
        inventory.sort((a, b) => a.name.localeCompare(b.name));
        
        inventoryTable.innerHTML = '';
        saleProductSelect.innerHTML = '<option value="">Selecione um produto</option>';
        inventory.forEach((product, index) => {
            const row = inventoryTable.insertRow();
            row.innerHTML = `
                <td>${product.name}</td>
                <td>${product.quantity}</td>
                <td>${product.price}</td>
                <td>${product.cost}</td>
                <td>${product.expiry}</td>
                <td><button class="remove-btn">Remover</button></td>
            `;
            const removeBtn = row.querySelector('.remove-btn');
            removeBtn.addEventListener('click', () => removeProduct(index));
            
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
    }
    
    function renderSalesHistory() {
        salesTable.innerHTML = '';
        let accumulated = 0;
        let accumulatedProfit = 0;
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
            accumulatedProfit += sale.profit;
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
    
    productForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('product-name').value.trim();
        const quantity = parseFloat(document.getElementById('product-quantity').value);
        const price = parseFloat(document.getElementById('product-price').value);
        const cost = parseFloat(document.getElementById('product-cost').value);
        const expiry = document.getElementById('product-expiry').value;
        
        // Validações
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
    
    saleForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const index = parseInt(saleProductSelect.value);
        const quantity = parseFloat(document.getElementById('sale-quantity').value);
        
        if (isNaN(index) || quantity <= 0) {
            alert('Selecione um produto e quantidade válida!');
            return;
        }
        
        if (inventory[index].quantity >= quantity) {
            inventory[index].quantity -= quantity;
            const value = quantity * inventory[index].price;
            const profit = quantity * (inventory[index].price - inventory[index].cost);
            totalSales += value;
            netProfit += profit;
            salesHistory.push({
                date: new Date().toLocaleDateString(),
                product: inventory[index].name,
                quantity,
                value,
                profit
            });
            // Remover produto se quantidade zerar
            if (inventory[index].quantity <= 0) {
                inventory.splice(index, 1);
            }
            saveData();
            renderInventory();
            renderSalesHistory();
            saleForm.reset();
            alert('Venda realizada com sucesso!');
        } else {
            alert('Quantidade insuficiente em estoque!');
        }
    });
    
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
    
    renderInventory();
    renderSalesHistory();
    // Ativar Home por padrão
    document.getElementById('home').classList.add('active');
    document.querySelector('[data-section="home"]').classList.add('active');
});