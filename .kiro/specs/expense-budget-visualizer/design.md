# Design Document: Expense & Budget Visualizer

## Overview

The Expense & Budget Visualizer is a client-side web application built with vanilla HTML5, CSS3, and JavaScript (ES2015+). It operates entirely in the browser using Local Storage for data persistence, eliminating the need for a backend server. The application provides a lightweight, responsive interface for tracking spending with real-time visual feedback through pie charts and balance displays.

**Key Design Principles:**
- **Client-Side Only**: No server processing or dynamic endpoints
- **Vanilla Stack**: Pure HTML, CSS, and JavaScript without frameworks
- **Progressive Enhancement**: Core functionality works even with minimal JavaScript support
- **Responsive Design**: Mobile-first approach supporting 320px minimum width
- **Real-Time Updates**: Synchronous updates across all components within 100ms
- **Data Integrity**: Atomic operations with validation at input boundaries

---

## Architecture

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Browser Application                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              User Interface Layer (HTML/CSS)              │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  • Input Form Component                                   │  │
│  │  • Transaction List Component                             │  │
│  │  • Balance Display Component                              │  │
│  │  • Chart Component (Pie Chart)                            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           ↕                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         Application Logic Layer (JavaScript)              │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  • Transaction Manager (CRUD operations)                  │  │
│  │  • Validation Engine                                      │  │
│  │  • Event Dispatcher                                       │  │
│  │  • Chart Renderer                                         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           ↕                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │        Data Persistence Layer (Local Storage)             │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  • Transaction Store                                      │  │
│  │  • Storage Serialization                                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Application Flow Diagram

```
User Input (Form)
     ↓
Validation Engine
     ↓ (Valid)
Transaction Manager
     ↓
Create Transaction Object
     ↓
Store in Local Storage
     ↓
Update Transaction List
Update Balance Display
Update Chart Component
     ↓
Display Success Feedback
```

---

## Components and Interfaces

### 1. Input Form Component

**Purpose**: Captures transaction details from the user with validation

**Responsibilities**:
- Display form fields: Item Name, Amount, Category dropdown
- Collect user input
- Trigger validation on form submission
- Display error messages when validation fails
- Clear form fields after successful submission

**HTML Structure**:
```
<form id="transaction-form">
  <input type="text" id="item-name" placeholder="Item Name" maxlength="100">
  <input type="number" id="amount" placeholder="Amount" min="0.01" max="999999.99" step="0.01">
  <select id="category">
    <option value="">Select Category</option>
    <option value="Food">Food</option>
    <option value="Transport">Transport</option>
    <option value="Fun">Fun</option>
  </select>
  <button type="submit">Add Transaction</button>
  <div id="error-message" class="error-hidden"></div>
</form>
```

**Key Properties**:
- Form validation state (valid/invalid)
- Error message display
- Field reset capability

**Validation Rules**:
- Item Name: non-empty, non-whitespace only, max 100 characters
- Amount: positive number, range 0.01-999999.99, max 2 decimal places
- Category: must be selected (Food, Transport, or Fun)

---

### 2. Transaction List Component

**Purpose**: Displays all recorded transactions in chronological order

**Responsibilities**:
- Display transactions in creation order (most recent last)
- Show item name, amount (2 decimal places), and category for each transaction
- Provide delete button for each transaction
- Handle deletion confirmation workflow
- Display empty state message when no transactions exist
- Support scrolling for large transaction lists

**HTML Structure**:
```
<div id="transaction-list-container">
  <div id="transaction-list">
    <!-- Transaction items dynamically inserted -->
    <div class="transaction-item" data-transaction-id="uuid">
      <span class="transaction-name">Item Name</span>
      <span class="transaction-amount">$0.00</span>
      <span class="transaction-category">Category</span>
      <button class="delete-btn" data-transaction-id="uuid">Delete</button>
    </div>
  </div>
  <div id="empty-state-message" class="hidden">
    No transactions yet. Start by adding one!
  </div>
</div>
```

**Constraints**:
- Maximum visible height with overflow:auto for scrolling
- Update within 100ms when transactions added/deleted
- Display transactions in strict creation order

---

### 3. Balance Display Component

**Purpose**: Shows the sum total of all transaction amounts

**Responsibilities**:
- Calculate total balance from all transactions
- Format output with exactly 2 decimal places
- Apply thousands separators for values ≥ 1000
- Display zero when no transactions exist
- Update within 100ms on transaction changes

**Display Format Examples**:
- `$0.00` (zero state)
- `$15.50` (basic amount)
- `$1,234.56` (thousands separator)
- `$999,999,999.99` (maximum valid)

**HTML Structure**:
```
<div id="balance-display">
  <label>Total Balance</label>
  <div id="balance-amount" class="balance-value">$0.00</div>
</div>
```

**Calculation Logic**:
- Sum all transaction amounts
- Validate against maximum 999,999,999.99
- Format with Intl.NumberFormat for localization support

---

### 4. Chart Component

**Purpose**: Visualizes spending distribution by category using a pie chart

**Responsibilities**:
- Aggregate spending by category
- Render pie chart using chart library
- Display category labels and amounts
- Update within 100ms on transaction changes
- Display "no data" message when empty
- Handle chart library load failures

**Chart Library Integration**:
- Library: Chart.js (no build step required, CDN-available)
- Data Format: Array of objects with {label, value}
- Rendering Target: Canvas element

**HTML Structure**:
```
<div id="chart-component">
  <canvas id="spending-chart"></canvas>
  <div id="chart-error" class="hidden">Error loading chart library</div>
  <div id="chart-empty" class="hidden">No spending data available</div>
</div>
```

**Data Aggregation**:
- Filter transactions by category
- Sum amounts per category
- Exclude categories with zero spending
- Pass to chart library API

---

### 5. Storage Manager Component

**Purpose**: Handles all Local Storage operations

**Responsibilities**:
- Read transactions from Local Storage on app load
- Write transactions to Local Storage on create/delete
- Validate stored data for corruption
- Handle storage quota exceeded errors
- Handle disabled Local Storage gracefully

**Storage Schema**:
```json
{
  "transactions": [
    {
      "id": "uuid-string",
      "name": "Item Name",
      "amount": 15.50,
      "category": "Food",
      "timestamp": 1234567890000
    }
  ]
}
```

**Error Scenarios**:
- Local Storage quota exceeded: Display error, don't remove transaction
- Corrupted data on load: Discard invalid data, initialize with empty
- Local Storage disabled: Display error message
- Invalid JSON: Parse error handling with fallback

---

## Data Models

### Transaction Object

```javascript
{
  id: string,           // UUID v4 format, unique identifier
  name: string,         // 1-100 characters, non-whitespace
  amount: number,       // 0.01 to 999999.99, 2 decimal precision
  category: string,     // One of: "Food", "Transport", "Fun"
  timestamp: number     // Unix timestamp in milliseconds
}
```

### Application State

```javascript
{
  transactions: Transaction[],
  storageAvailable: boolean,
  isLoading: boolean,
  errorMessage: string | null
}
```

### Chart Data Format

```javascript
{
  labels: ['Food', 'Transport', 'Fun'],
  datasets: [{
    label: 'Spending by Category',
    data: [150.00, 75.50, 200.00],
    backgroundColor: [...],
    borderColor: [...],
    borderWidth: 1
  }]
}
```

---

## Data Flow

### Add Transaction Flow

```
User submits form
  ↓
InputForm triggers "submit" event
  ↓
ValidationEngine validates input
  ↓
If invalid:
  └→ Display error message
  └→ Clear error on next submission attempt
  
If valid:
  ↓
  TransactionManager.create()
    ↓
    Generate UUID
    ↓
    Create Transaction object
    ↓
    StorageManager.save(transaction)
      ↓ (if success)
      Update Local Storage
    ↓
    transactions array updated
    ↓
    Emit "transaction:created" event
      ↓
      TransactionList.render()
      BalanceDisplay.update()
      ChartComponent.update()
    ↓
    InputForm.clear()
    ↓
    Display success feedback (visual/message)
```

### Delete Transaction Flow

```
User clicks delete button
  ↓
ConfirmationDialog.show()
  ↓
User confirms deletion
  ↓
TransactionManager.delete(transactionId)
  ↓
StorageManager.remove(transactionId)
  ↓ (if success)
  Update Local Storage
  ↓
  transactions array updated
  ↓
  Emit "transaction:deleted" event
    ↓
    TransactionList.render()
    BalanceDisplay.update()
    ChartComponent.update()
  ↓
  Display deletion feedback
```

### Application Load Flow

```
Page load
  ↓
Initialize UI (HTML/CSS)
  ↓
StorageManager.loadAll()
  ↓
Check if Local Storage available
  ↓
If available:
  ↓
  Retrieve transactions
  ↓
  Validate data integrity
  ↓
  If valid: transactions array = retrieved data
  ↓
  If invalid: transactions array = [], discard data
  
If not available:
  ↓
  Display error message
  ↓
  transactions array = []

  ↓
  Render initial UI
    ↓
    TransactionList.render(transactions)
    BalanceDisplay.update(transactions)
    ChartComponent.update(transactions)
  ↓
  Application ready

(If Local Storage retrieval > 500ms)
  ↓
  Display loading indicator
  ↓
  Proceed with empty state while loading
```

---

## Error Handling

### Input Validation Errors

| Error Type | Trigger | User Feedback | Recovery |
|-----------|---------|---------------|----------|
| Empty Item Name | Submit with blank field | "Item name is required" | User re-enters, error cleared |
| Whitespace Item Name | Submit with spaces only | "Item name cannot be empty" | User re-enters, error cleared |
| Invalid Amount (zero) | Submit with 0 | "Amount must be greater than 0" | User re-enters, error cleared |
| Invalid Amount (range) | Submit with >999999.99 | "Amount must not exceed 999,999.99" | User re-enters, error cleared |
| Invalid Amount (format) | Submit with >2 decimals | "Amount must have max 2 decimal places" | Browser native validation |
| Missing Category | Submit without selection | "Please select a category" | User selects, error cleared |

### Storage Errors

| Error Type | Trigger | User Feedback | Recovery |
|-----------|---------|---------------|----------|
| Local Storage Disabled | On app load | "Local Storage is disabled. Transactions won't be saved." | App functions normally; data lost on refresh |
| Quota Exceeded | On add/delete | "Storage limit exceeded. Please delete some transactions." | Transaction NOT created; keep existing data |
| Corrupted Data | On app load | "Corrupted data detected. Starting fresh." | Clear invalid data; initialize with empty state |
| Parse Error | On data retrieval | "Error loading transactions. Starting fresh." | Fallback to empty state |

### Chart Errors

| Error Type | Trigger | User Feedback | Recovery |
|-----------|---------|---------------|----------|
| Chart Library Not Loaded | On initialization | "Chart library failed to load" | Display empty chart container; app still functional |
| Invalid Chart Data | During render | Chart displays empty state | Show "No data" message |

---

## Correctness Properties

**Assessment: Is Property-Based Testing Appropriate?**

This feature is a client-side web application with pure functions for validation, calculation, and data transformation. The application logic (validation, balance calculation, category aggregation) can be tested with property-based testing to ensure correctness across a wide input space. However, UI rendering and Local Storage operations are better tested with example-based unit tests and integration tests.

**PBT is applicable for:**
- Validation engine (input constraints on item names, amounts, categories)
- Balance calculation (sum accuracy and formatting)
- Category aggregation (data transformation and grouping)
- Transaction object creation (unique IDs and data integrity)
- Transaction ordering (chronological preservation)

**PBT is NOT applicable for:**
- DOM manipulation and rendering (UI component testing)
- Local Storage I/O operations (integration tests required)
- Chart library rendering (external library responsibility)
- Event handling and async operations (example-based tests)
- Performance timing (benchmarking tests)
- Layout and responsive design (visual regression tests)

---

### Property 1: Item Name Validation

*For any* string input as an item name, if the string is non-empty and composed of at least one non-whitespace character with total length ≤ 100 characters, then validation SHALL pass; otherwise, validation SHALL fail.

**Validates: Requirements 1.3, 1.5**

---

### Property 2: Amount Validation Range and Precision

*For any* numeric input as an amount, if the value is a positive number greater than 0 and ≤ 999999.99 with at most 2 decimal places, then validation SHALL pass; otherwise, validation SHALL fail.

**Validates: Requirements 1.2, 1.6, 2.4**

---

### Property 3: Category Validation

*For any* category input, if the value is exactly one of the allowed categories (Food, Transport, or Fun), then validation SHALL pass; otherwise, validation SHALL fail.

**Validates: Requirements 1.4, 1.7**

---

### Property 4: Transaction Creation with Valid Input

*For any* valid input (non-empty item name, positive amount, selected category), when validation succeeds, the application SHALL create a transaction object containing all provided data.

**Validates: Requirements 1.9**

---

### Property 5: Balance Calculation Correctness

*For any* collection of transactions, the calculated total balance SHALL equal the sum of all individual transaction amounts, with the result represented as a fixed 2 decimal place number.

**Validates: Requirements 4.2, 4.7**

---

### Property 6: Balance Display Formatting

*For any* valid numeric balance value, the formatted display output SHALL include exactly 2 decimal places and SHALL include thousands separators (commas) for values ≥ 1000.

**Validates: Requirements 4.3**

---

### Property 7: Category Aggregation Correctness

*For any* collection of transactions, when transactions are grouped by category, the sum of amounts for each category in the aggregation SHALL match the actual total spending for that category across all transactions.

**Validates: Requirements 5.2, 5.4**

---

### Property 8: Category Zero-Spending Exclusion

*For any* set of transactions, when aggregating spending by category, all categories with zero total spending SHALL be excluded from the result, and only categories with at least one transaction SHALL appear.

**Validates: Requirements 5.3, 5.5**

---

### Property 9: Transaction Display Formatting

*For any* transaction in the transaction list, the displayed output SHALL include the item name, the amount formatted with exactly 2 decimal places, and the category.

**Validates: Requirements 2.3**

---

### Property 10: Transaction Unique Identifier Generation

*For any* collection of transactions created, each transaction SHALL have a unique identifier that does not match the identifier of any other transaction in the collection.

**Validates: Requirements 6.1**

---

### Property 11: Transaction List Order Preservation

*For any* sequence of transactions added in chronological order, the transaction list display SHALL maintain the same order, with the most recently added transaction appearing last.

**Validates: Requirements 2.7**

---

### Property 12: Transaction Persistence Round-Trip

*For any* valid transaction object stored to Local Storage and subsequently retrieved, the retrieved transaction SHALL match the original in all fields (id, name, amount, category, timestamp).

**Validates: Requirements 6.2, 6.4**

---

## Testing Strategy

### Unit Tests (Example-Based)

**Input Form Component:**
- ✓ Form displays all required fields (Item Name, Amount, Category)
- ✓ Form displays Category options: Food, Transport, Fun
- ✓ Form clears after successful submission
- ✓ Form displays specific error messages for each validation failure type
- ✓ Error message clears on next submission attempt
- ✓ Form requires non-empty category selection
- ✓ Form rejects empty item names with error message
- ✓ Form rejects whitespace-only item names with error message
- ✓ Form rejects zero or negative amounts with error message
- ✓ Form rejects amounts exceeding 999999.99 with error message
- ✓ Form rejects amounts with >2 decimal places

**Transaction Manager:**
- ✓ Creating a transaction generates a unique UUID
- ✓ All created transactions have unique IDs (no duplicates across collection)
- ✓ Creating a transaction assigns correct timestamp
- ✓ Deleting a transaction removes it from the collection
- ✓ Transaction list preserves creation order (FIFO)
- ✓ Transaction with all required fields can be created

**Balance Display:**
- ✓ Balance displays 0.00 with no transactions
- ✓ Balance correctly sums two transactions
- ✓ Balance correctly sums multiple transactions
- ✓ Balance applies thousands separators at exactly 1000
- ✓ Balance applies thousands separators at 1000000+
- ✓ Balance respects maximum value constraint (≤ 999,999,999.99)
- ✓ Balance formats with exactly 2 decimal places

**Chart Component:**
- ✓ Chart aggregates spending by category correctly
- ✓ Chart excludes categories with zero spending
- ✓ Chart includes only categories with at least one transaction
- ✓ Chart displays category name and total amount for each category
- ✓ Chart displays empty state message when no data exists
- ✓ Chart displays error message on library load failure

**Storage Manager:**
- ✓ Loads transactions from Local Storage on app init
- ✓ Saves new transaction to Local Storage
- ✓ Deletes transaction from Local Storage by ID
- ✓ Handles empty Local Storage gracefully (initialize with zero transactions)
- ✓ Handles corrupted JSON data (discard and initialize empty)
- ✓ Handles Local Storage quota exceeded (display error, don't create transaction)
- ✓ Handles disabled Local Storage (display error message)

**Transaction Display:**
- ✓ Transaction displays item name
- ✓ Transaction displays amount with exactly 2 decimal places
- ✓ Transaction displays category
- ✓ Delete button present for each transaction
- ✓ Empty state message displays when no transactions

**Form Input Responsiveness (Performance):**
- ✓ Form responds to Item Name input within 50ms
- ✓ Form responds to Amount input within 50ms
- ✓ Form responds to Category selection within 50ms

**Deletion Workflow:**
- ✓ Delete button triggers confirmation dialog
- ✓ User can cancel deletion
- ✓ User can confirm deletion
- ✓ Confirmed deletion removes transaction from list
- ✓ Deletion provides visual feedback
- ✓ Failed storage deletion shows error and preserves transaction

**Initialization Performance:**
- ✓ Application displays all components in interactive state within 500ms
- ✓ If Local Storage retrieval exceeds 500ms, loading indicator displays

### Property-Based Tests (100+ iterations each)

**Validation Engine - Property Tests:**

- **P1**: Item name validation across all string variations
  - Generators: strings (empty, whitespace, alphanumeric, special chars, length 1-100+)
  - Validates: item name requirement, length constraint
  - Tag: `Feature: expense-budget-visualizer, Property 1: Item Name Validation`

- **P2**: Amount validation across all numeric variations
  - Generators: numbers (negative, zero, positive, decimals, range boundaries)
  - Validates: positive number constraint, range 0.01-999999.99, 2 decimal precision
  - Tag: `Feature: expense-budget-visualizer, Property 2: Amount Validation Range and Precision`

- **P3**: Category validation across all inputs
  - Generators: strings (empty, valid categories, invalid categories, case variations)
  - Validates: category selection requirement, allowed values
  - Tag: `Feature: expense-budget-visualizer, Property 3: Category Validation`

**Calculation Engine - Property Tests:**

- **P4**: Transaction creation with valid input
  - Generators: valid (name, amount, category) tuples
  - Validates: transaction object creation, data preservation
  - Tag: `Feature: expense-budget-visualizer, Property 4: Transaction Creation with Valid Input`

- **P5**: Balance calculation accuracy
  - Generators: collections of random transactions (0-1000 transactions)
  - Validates: sum calculation, decimal precision (exactly 2 places)
  - Tag: `Feature: expense-budget-visualizer, Property 5: Balance Calculation Correctness`

- **P6**: Balance display formatting
  - Generators: numeric balances (0, <1000, ≥1000, with decimals)
  - Validates: thousands separator application, 2 decimal place formatting
  - Tag: `Feature: expense-budget-visualizer, Property 6: Balance Display Formatting`

**Data Aggregation - Property Tests:**

- **P7**: Category aggregation correctness
  - Generators: collections of transactions across categories
  - Validates: category grouping, sum per category
  - Tag: `Feature: expense-budget-visualizer, Property 7: Category Aggregation Correctness`

- **P8**: Category zero-spending exclusion
  - Generators: transaction collections with varying category coverage
  - Validates: exclusion of zero-spending categories
  - Tag: `Feature: expense-budget-visualizer, Property 8: Category Zero-Spending Exclusion`

- **P9**: Transaction display formatting
  - Generators: random transactions
  - Validates: name display, amount formatting (2 decimals), category display
  - Tag: `Feature: expense-budget-visualizer, Property 9: Transaction Display Formatting`

**Data Integrity - Property Tests:**

- **P10**: Transaction unique identifier generation
  - Generators: sequences of transaction creation
  - Validates: uniqueness of all IDs in collection
  - Tag: `Feature: expense-budget-visualizer, Property 10: Transaction Unique Identifier Generation`

- **P11**: Transaction list order preservation
  - Generators: sequences of transactions added in order
  - Validates: FIFO ordering maintained, most recent appears last
  - Tag: `Feature: expense-budget-visualizer, Property 11: Transaction List Order Preservation`

- **P12**: Transaction persistence round-trip
  - Generators: random transactions, serialize to JSON, deserialize
  - Validates: data preservation through serialization cycle
  - Tag: `Feature: expense-budget-visualizer, Property 12: Transaction Persistence Round-Trip`

### Integration Tests

**Transaction Operations:**
- ✓ Add transaction updates all components (list, balance, chart) within 100ms
- ✓ Delete transaction updates all components within 100ms
- ✓ Multiple rapid additions maintain order correctly
- ✓ Multiple rapid deletions reflect correctly in all components

**Storage Persistence:**
- ✓ Application loads with no prior data (empty state)
- ✓ Application loads with existing transactions (persisted data)
- ✓ Storage persists through page reload
- ✓ New transactions added to existing data
- ✓ Deleted transactions removed from storage

**Chart Library:**
- ✓ Chart library loads successfully from CDN
- ✓ Chart renders with valid transaction data
- ✓ Chart updates when transactions change
- ✓ Chart library load failure shows error message

**Responsive Design:**
- ✓ Mobile layout displays correctly at 320px viewport
- ✓ Tablet layout displays correctly at 768px viewport
- ✓ Desktop layout displays correctly at 1200px+ viewport
- ✓ Touch targets are minimum 44x44 pixels
- ✓ Text is minimum 14px font size
- ✓ Whitespace separates distinct sections

**Error Handling:**
- ✓ Invalid form input shows specific error message
- ✓ Storage quota exceeded prevents transaction creation
- ✓ Corrupted storage data is discarded on load
- ✓ Disabled storage shows error message
- ✓ Chart library failure shows error message

**Browser Compatibility:**
- ✓ All core requirements work in Chrome 90+
- ✓ All core requirements work in Firefox 88+
- ✓ All core requirements work in Edge 90+
- ✓ All core requirements work in Safari 14+
- ✓ All core requirements work in mobile Chrome
- ✓ All core requirements work in mobile Safari

### Performance Benchmarks

| Operation | Target | Test Method |
|-----------|--------|------------|
| Form input response | < 50ms | Measure keypress to DOM update |
| Category selection response | < 50ms | Measure selection to DOM update |
| Transaction add (all components) | < 100ms | Measure form submit to all updates |
| Transaction delete (all components) | < 100ms | Measure delete click to all updates |
| App initialization | < 500ms | Measure page load to interactive state |
| Local Storage retrieval | < 500ms | Measure retrieval time; show loader if exceeded |

### Testing Tools & Setup

**Property-Based Testing Framework:**
- Recommend: fast-check (JavaScript) or similar framework supporting 100+ iterations
- Each property test runs minimum 100 iterations with randomized inputs
- Shrinking enabled for failure analysis

**Example-Based Testing Framework:**
- Recommend: Jest or Vitest
- Unit tests for component interactions
- DOM testing with jsdom or similar

**Integration Testing:**
- E2E tests with Playwright or Cypress
- Cross-browser testing in specified browsers
- Performance monitoring with performance.now()



---

## Error Handling & Recovery

### Strategy: Fail-Safe with User Notification

1. **Input Validation**: Reject invalid input, display specific error message
2. **Storage Failures**: Show error, maintain current state, don't lose data
3. **Chart Rendering**: Display fallback message, application remains functional
4. **Async Operations**: Display loading indicator, implement timeout after 500ms

### Error Recovery Flows

**Invalid Input**:
```
User submits form with invalid data
  ↓
Validation fails
  ↓
Display error message
  ↓
User corrects input
  ↓
Clear previous error message
  ↓
Validation passes
  ↓
Continue with submission
```

**Local Storage Quota Exceeded**:
```
User adds transaction
  ↓
Storage quota exceeded
  ↓
Transaction NOT created
  ↓
Display error: "Storage limit exceeded"
  ↓
User deletes old transactions to free space
  ↓
Retry adding transaction
```

**Corrupted Local Storage**:
```
App loads
  ↓
Local Storage contains invalid JSON
  ↓
Parsing fails
  ↓
Clear invalid data
  ↓
Initialize with empty state
  ↓
Display message: "Data reset due to corruption"
```

---

## Performance Considerations

### Optimization Strategies

1. **Real-Time Responsiveness**:
   - Use synchronous DOM updates for < 100ms response time
   - Batch updates where possible (single reflow)
   - Avoid nested animations during update cycles

2. **Memory Efficiency**:
   - Transactions stored in memory (array in JavaScript)
   - Scale tested to handle 1000+ transactions
   - Local Storage uses JSON serialization

3. **Chart Rendering**:
   - Recreate chart on data change (Chart.js handles optimization)
   - Throttle updates during rapid changes
   - Lazy-load chart library if needed

4. **Storage I/O**:
   - Synchronous Local Storage operations (acceptable for small data)
   - Validate data before storing
   - Implement loading indicator for > 500ms retrieval

---

## File Structure

```
project-root/
├── index.html              # Single HTML file with all markup
├── css/
│   └── styles.css          # Single CSS file with all styles
├── js/
│   └── app.js              # Single JavaScript file with all logic
└── README.md               # Documentation
```

**Design Rationale**:
- Requirement 9 mandates exactly one file per type
- No subdirectories within css/ or js/
- Simplifies deployment and maintenance
- Reduces HTTP requests

---

## Deployment & Accessibility

### Deployment

- Serve as static files (no build step required)
- Works with any web server or CDN
- No transpilation needed (ES2015+ supported in modern browsers)
- Single HTML file can be opened directly in browser

### Accessibility Considerations

- Minimum 14px font size for body text
- Semantic HTML structure
- Headings visually distinguishable
- Touch targets minimum 44x44 pixels
- Form labels associated with inputs
- Error messages linked to form fields
- Keyboard navigation support for all interactive elements
- Color contrast compliance

---

## Technology Stack Summary

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Structure | HTML5 | Valid semantic markup, no frameworks |
| Styling | CSS3 | Responsive design, flexbox/grid layout |
| Logic | JavaScript (ES2015+) | Vanilla, no frameworks or transpilation |
| Charting | Chart.js 3.x | No build step, CDN available |
| Storage | Browser Local Storage API | Built-in, no server needed |
| UUID Generation | crypto.getRandomValues() | Native browser API |
| Number Formatting | Intl.NumberFormat | Built-in, localization support |

