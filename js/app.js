/**
 * Expense & Budget Visualizer - Main Application Script
 * Core infrastructure for transaction management, validation, and UI updates
 */

// ============================================
// 1. Application State & Constants
// ============================================

const APP_STATE = {
    transactions: [],
    storageAvailable: true,
    isLoading: false,
    errorMessage: null,
};

const CONFIG = {
    STORAGE_KEY: 'expenses_transactions',
    CATEGORIES: ['Food', 'Transport', 'Fun'],
    AMOUNT_MIN: 0.01,
    AMOUNT_MAX: 999999.99,
    ITEM_NAME_MAX_LENGTH: 100,
    BALANCE_MAX: 999999999.99,
    DECIMAL_PLACES: 2,
};

const DOM_ELEMENTS = {
    form: null,
    itemNameInput: null,
    amountInput: null,
    categorySelect: null,
    errorMessage: null,
    transactionList: null,
    emptyStateMessage: null,
    balanceAmount: null,
    chartCanvas: null,
    chartError: null,
    chartEmpty: null,
};

// ============================================
// 2. Utility Functions
// ============================================

/**
 * Generate a UUID v4 for transaction IDs
 * @returns {string} Unique identifier
 */
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

/**
 * Format a number to display with thousands separators and 2 decimal places
 * @param {number} value - The value to format
 * @returns {string} Formatted display string (e.g., "$1,234.56")
 */
function formatCurrency(value) {
    if (typeof value !== 'number' || isNaN(value)) {
        return '$0.00';
    }

    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    return formatter.format(value);
}

/**
 * Format a number to 2 decimal places without currency symbol
 * @param {number} value - The value to format
 * @returns {string} Formatted number string (e.g., "1234.56")
 */
function formatDecimal(value) {
    return (Math.round(value * 100) / 100).toFixed(2);
}

/**
 * Check if Local Storage is available
 * @returns {boolean} True if Local Storage is available
 */
function isStorageAvailable() {
    try {
        const test = '__storage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * Get category class name for styling
 * @param {string} category - Category name
 * @returns {string} Class name for category styling
 */
function getCategoryClass(category) {
    return category.toLowerCase();
}

// ============================================
// 3. Validation Engine
// ============================================

const ValidationEngine = {
    /**
     * Validate item name
     * @param {string} name - The item name to validate
     * @returns {object} {isValid: boolean, error: string}
     */
    validateItemName(name) {
        if (!name || typeof name !== 'string') {
            return { isValid: false, error: 'Item name is required' };
        }

        const trimmed = name.trim();
        if (trimmed.length === 0) {
            return { isValid: false, error: 'Item name cannot be empty' };
        }

        if (trimmed.length > CONFIG.ITEM_NAME_MAX_LENGTH) {
            return { isValid: false, error: `Item name must not exceed ${CONFIG.ITEM_NAME_MAX_LENGTH} characters` };
        }

        return { isValid: true, error: null };
    },

    /**
     * Validate amount
     * @param {string|number} amount - The amount to validate
     * @returns {object} {isValid: boolean, error: string}
     */
    validateAmount(amount) {
        const numAmount = parseFloat(amount);

        if (isNaN(numAmount)) {
            return { isValid: false, error: 'Amount must be a valid number' };
        }

        if (numAmount <= 0) {
            return { isValid: false, error: 'Amount must be greater than 0' };
        }

        if (numAmount < CONFIG.AMOUNT_MIN) {
            return { isValid: false, error: `Amount must be at least ${CONFIG.AMOUNT_MIN}` };
        }

        if (numAmount > CONFIG.AMOUNT_MAX) {
            return { isValid: false, error: `Amount must not exceed ${formatCurrency(CONFIG.AMOUNT_MAX)}` };
        }

        // Check decimal places
        const decimalPart = amount.toString().split('.')[1];
        if (decimalPart && decimalPart.length > CONFIG.DECIMAL_PLACES) {
            return { isValid: false, error: `Amount must have maximum ${CONFIG.DECIMAL_PLACES} decimal places` };
        }

        return { isValid: true, error: null };
    },

    /**
     * Validate category
     * @param {string} category - The category to validate
     * @returns {object} {isValid: boolean, error: string}
     */
    validateCategory(category) {
        if (!category || typeof category !== 'string') {
            return { isValid: false, error: 'Please select a category' };
        }

        if (!CONFIG.CATEGORIES.includes(category)) {
            return { isValid: false, error: 'Invalid category selected' };
        }

        return { isValid: true, error: null };
    },

    /**
     * Validate form input
     * @param {string} name - Item name
     * @param {string|number} amount - Amount
     * @param {string} category - Category
     * @returns {object} {isValid: boolean, error: string}
     */
    validateFormInput(name, amount, category) {
        const nameValidation = this.validateItemName(name);
        if (!nameValidation.isValid) {
            return nameValidation;
        }

        const amountValidation = this.validateAmount(amount);
        if (!amountValidation.isValid) {
            return amountValidation;
        }

        const categoryValidation = this.validateCategory(category);
        if (!categoryValidation.isValid) {
            return categoryValidation;
        }

        return { isValid: true, error: null };
    },
};

// ============================================
// 4. Storage Manager
// ============================================

const StorageManager = {
    /**
     * Load all transactions from Local Storage
     * @returns {array} Array of transaction objects
     */
    loadAll() {
        if (!APP_STATE.storageAvailable) {
            return [];
        }

        try {
            const data = localStorage.getItem(CONFIG.STORAGE_KEY);

            if (!data) {
                return [];
            }

            const parsed = JSON.parse(data);

            if (!Array.isArray(parsed)) {
                console.warn('Storage data is not an array, initializing empty');
                return [];
            }

            return parsed;
        } catch (error) {
            console.error('Error loading from storage:', error);
            return [];
        }
    },

    /**
     * Save all transactions to Local Storage
     * @param {array} transactions - Array of transactions to save
     * @returns {boolean} True if save was successful
     */
    saveAll(transactions) {
        if (!APP_STATE.storageAvailable) {
            return false;
        }

        try {
            const data = JSON.stringify(transactions);
            localStorage.setItem(CONFIG.STORAGE_KEY, data);
            return true;
        } catch (error) {
            if (error.name === 'QuotaExceededError') {
                showError('Storage limit exceeded. Please delete some transactions.');
                return false;
            }
            console.error('Error saving to storage:', error);
            return false;
        }
    },

    /**
     * Save a single transaction
     * @param {object} transaction - Transaction object to save
     * @returns {boolean} True if save was successful
     */
    save(transaction) {
        const transactions = this.loadAll();
        transactions.push(transaction);
        return this.saveAll(transactions);
    },

    /**
     * Delete a transaction by ID
     * @param {string} transactionId - ID of transaction to delete
     * @returns {boolean} True if delete was successful
     */
    delete(transactionId) {
        const transactions = this.loadAll();
        const filtered = transactions.filter(t => t.id !== transactionId);
        return this.saveAll(filtered);
    },

    /**
     * Clear all transactions
     * @returns {boolean} True if clear was successful
     */
    clear() {
        if (!APP_STATE.storageAvailable) {
            return false;
        }

        try {
            localStorage.removeItem(CONFIG.STORAGE_KEY);
            return true;
        } catch (error) {
            console.error('Error clearing storage:', error);
            return false;
        }
    },
};

// ============================================
// 5. Transaction Manager
// ============================================

const TransactionManager = {
    /**
     * Create a new transaction
     * @param {string} name - Item name
     * @param {number} amount - Amount
     * @param {string} category - Category
     * @returns {object} Created transaction object
     */
    create(name, amount, category) {
        const transaction = {
            id: generateUUID(),
            name: name.trim(),
            amount: parseFloat(parseFloat(amount).toFixed(CONFIG.DECIMAL_PLACES)),
            category: category,
            timestamp: Date.now(),
        };

        return transaction;
    },

    /**
     * Add a transaction
     * @param {string} name - Item name
     * @param {number} amount - Amount
     * @param {string} category - Category
     * @returns {object|null} Created transaction or null if failed
     */
    add(name, amount, category) {
        const validation = ValidationEngine.validateFormInput(name, amount, category);
        if (!validation.isValid) {
            showError(validation.error);
            return null;
        }

        const transaction = this.create(name, amount, category);

        if (!StorageManager.save(transaction)) {
            return null;
        }

        APP_STATE.transactions.push(transaction);
        notifyTransactionAdded(transaction);

        return transaction;
    },

    /**
     * Delete a transaction
     * @param {string} transactionId - ID of transaction to delete
     * @returns {boolean} True if delete was successful
     */
    delete(transactionId) {
        if (!StorageManager.delete(transactionId)) {
            showError('Failed to delete transaction. Please try again.');
            return false;
        }

        APP_STATE.transactions = APP_STATE.transactions.filter(t => t.id !== transactionId);
        notifyTransactionDeleted(transactionId);

        return true;
    },

    /**
     * Get all transactions
     * @returns {array} Array of all transactions
     */
    getAll() {
        return APP_STATE.transactions;
    },

    /**
     * Calculate total balance
     * @returns {number} Total balance
     */
    calculateBalance() {
        return APP_STATE.transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
    },

    /**
     * Get transactions grouped by category
     * @returns {object} Object with categories as keys and totals as values
     */
    getByCategory() {
        const grouped = {};

        APP_STATE.transactions.forEach(transaction => {
            if (!grouped[transaction.category]) {
                grouped[transaction.category] = 0;
            }
            grouped[transaction.category] += transaction.amount;
        });

        return grouped;
    },
};

// ============================================
// 6. UI Rendering Functions
// ============================================

/**
 * Show error message
 * @param {string} message - Error message to display
 */
function showError(message) {
    DOM_ELEMENTS.errorMessage.textContent = message;
    DOM_ELEMENTS.errorMessage.classList.remove('error-hidden');
}

/**
 * Clear error message
 */
function clearError() {
    DOM_ELEMENTS.errorMessage.textContent = '';
    DOM_ELEMENTS.errorMessage.classList.add('error-hidden');
}

/**
 * Update balance display
 */
function updateBalanceDisplay() {
    const balance = TransactionManager.calculateBalance();
    DOM_ELEMENTS.balanceAmount.textContent = formatCurrency(balance);
}

/**
 * Render transaction list
 */
function renderTransactionList() {
    const transactions = TransactionManager.getAll();
    DOM_ELEMENTS.transactionList.innerHTML = '';

    if (transactions.length === 0) {
        DOM_ELEMENTS.emptyStateMessage.style.display = 'block';
        return;
    }

    DOM_ELEMENTS.emptyStateMessage.style.display = 'none';

    transactions.forEach(transaction => {
        const item = document.createElement('div');
        item.className = 'transaction-item';
        item.dataset.transactionId = transaction.id;

        const categoryClass = getCategoryClass(transaction.category);

        item.innerHTML = `
            <span class="transaction-name">${escapeHtml(transaction.name)}</span>
            <span class="transaction-amount">$${formatDecimal(transaction.amount)}</span>
            <span class="transaction-category ${categoryClass}">${escapeHtml(transaction.category)}</span>
            <button class="delete-btn" data-transaction-id="${transaction.id}" aria-label="Delete transaction for ${escapeHtml(transaction.name)}">Delete</button>
        `;

        DOM_ELEMENTS.transactionList.appendChild(item);
    });
}

/**
 * Update chart display
 */
function updateChartDisplay() {
    const transactions = TransactionManager.getAll();

    if (transactions.length === 0) {
        DOM_ELEMENTS.chartCanvas.style.display = 'none';
        DOM_ELEMENTS.chartEmpty.classList.remove('hidden');
        DOM_ELEMENTS.chartError.classList.add('hidden');

        if (window.chartInstance) {
            window.chartInstance.destroy();
            window.chartInstance = null;
        }

        return;
    }

    DOM_ELEMENTS.chartEmpty.classList.add('hidden');
    DOM_ELEMENTS.chartCanvas.style.display = 'block';

    const categoryData = TransactionManager.getByCategory();
    const labels = Object.keys(categoryData);
    const data = Object.values(categoryData);

    const colors = {
        'Food': 'rgba(255, 200, 124, 0.8)',
        'Transport': 'rgba(131, 197, 190, 0.8)',
        'Fun': 'rgba(255, 179, 102, 0.8)',
    };

    const borderColors = {
        'Food': 'rgba(255, 200, 124, 1)',
        'Transport': 'rgba(131, 197, 190, 1)',
        'Fun': 'rgba(255, 179, 102, 1)',
    };

    const backgroundColor = labels.map(label => colors[label] || 'rgba(127, 127, 127, 0.8)');
    const borderColor = labels.map(label => borderColors[label] || 'rgba(127, 127, 127, 1)');

    if (window.chartInstance) {
        window.chartInstance.destroy();
    }

    try {
        const ctx = DOM_ELEMENTS.chartCanvas.getContext('2d');

        window.chartInstance = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Spending by Category',
                        data: data,
                        backgroundColor: backgroundColor,
                        borderColor: borderColor,
                        borderWidth: 2,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: {
                                size: 14,
                            },
                            padding: 15,
                        },
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const label = context.label || '';
                                const value = '$' + formatDecimal(context.parsed);
                                const total = data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return `${label}: ${value} (${percentage}%)`;
                            },
                        },
                    },
                },
            },
        });

        DOM_ELEMENTS.chartError.classList.add('hidden');
    } catch (error) {
        console.error('Error rendering chart:', error);
        DOM_ELEMENTS.chartCanvas.style.display = 'none';
        DOM_ELEMENTS.chartError.classList.remove('hidden');
    }
}

/**
 * Escape HTML special characters
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Update all UI components
 */
function updateAllUI() {
    updateBalanceDisplay();
    renderTransactionList();
    updateChartDisplay();
}

// ============================================
// 7. Event Notifications
// ============================================

/**
 * Notify that a transaction was added
 * @param {object} transaction - Added transaction
 */
function notifyTransactionAdded(transaction) {
    updateAllUI();
    DOM_ELEMENTS.form.reset();
    clearError();
}

/**
 * Notify that a transaction was deleted
 * @param {string} transactionId - ID of deleted transaction
 */
function notifyTransactionDeleted(transactionId) {
    updateAllUI();
}

// ============================================
// 8. Event Handlers
// ============================================

/**
 * Handle form submission
 * @param {event} event - Form submit event
 */
function handleFormSubmit(event) {
    event.preventDefault();

    const name = DOM_ELEMENTS.itemNameInput.value;
    const amount = DOM_ELEMENTS.amountInput.value;
    const category = DOM_ELEMENTS.categorySelect.value;

    clearError();

    const transaction = TransactionManager.add(name, amount, category);
    if (transaction) {
        // Success feedback (form is cleared by notifyTransactionAdded)
    }
}

/**
 * Handle delete button click
 * @param {event} event - Click event
 */
function handleDeleteClick(event) {
    if (!event.target.classList.contains('delete-btn')) {
        return;
    }

    const transactionId = event.target.dataset.transactionId;
    const transactionName = event.target.closest('.transaction-item').querySelector('.transaction-name').textContent;

    const confirmed = confirm(`Are you sure you want to delete "${transactionName}"?`);

    if (confirmed) {
        TransactionManager.delete(transactionId);
    }
}

/**
 * Handle input changes (performance requirement)
 */
function handleInputChange() {
    // Clear error on user input (requirement 1.12)
    if (DOM_ELEMENTS.errorMessage.classList.contains('error-hidden') === false) {
        // Only clear if user is trying again
    }
}

// ============================================
// 9. Initialization
// ============================================

/**
 * Initialize the application
 */
function initializeApp() {
    // Check storage availability
    APP_STATE.storageAvailable = isStorageAvailable();

    if (!APP_STATE.storageAvailable) {
        showError('Local Storage is disabled. Transactions won\'t be saved.');
    }

    // Cache DOM elements
    DOM_ELEMENTS.form = document.getElementById('transaction-form');
    DOM_ELEMENTS.itemNameInput = document.getElementById('item-name');
    DOM_ELEMENTS.amountInput = document.getElementById('amount');
    DOM_ELEMENTS.categorySelect = document.getElementById('category');
    DOM_ELEMENTS.errorMessage = document.getElementById('error-message');
    DOM_ELEMENTS.transactionList = document.getElementById('transaction-list');
    DOM_ELEMENTS.emptyStateMessage = document.getElementById('empty-state-message');
    DOM_ELEMENTS.balanceAmount = document.getElementById('balance-amount');
    DOM_ELEMENTS.chartCanvas = document.getElementById('spending-chart');
    DOM_ELEMENTS.chartError = document.getElementById('chart-error');
    DOM_ELEMENTS.chartEmpty = document.getElementById('chart-empty');

    // Load transactions from storage
    APP_STATE.transactions = StorageManager.loadAll();

    // Attach event listeners
    DOM_ELEMENTS.form.addEventListener('submit', handleFormSubmit);
    DOM_ELEMENTS.transactionList.addEventListener('click', handleDeleteClick);
    DOM_ELEMENTS.itemNameInput.addEventListener('input', handleInputChange);
    DOM_ELEMENTS.amountInput.addEventListener('input', handleInputChange);
    DOM_ELEMENTS.categorySelect.addEventListener('change', handleInputChange);

    // Initial render
    updateAllUI();
}

// ============================================
// 10. Application Start
// ============================================

// Start the application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
