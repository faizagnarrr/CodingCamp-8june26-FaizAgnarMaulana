# Design Document: Expense & Budget Visualizer Enhancements

## Overview

This design document specifies the technical architecture and implementation approach for three enhancement features to the Expense & Budget Visualizer application:

1. **Custom Categories Management** - Allow users to create, edit, and delete custom expense categories
2. **Transaction Sorting** - Enable flexible transaction sorting by amount and category with persistent preferences
3. **Dark/Light Mode Toggle** - Provide theme switching with automatic persistence and consistent styling

These enhancements build upon the existing MVP architecture while maintaining backward compatibility and adhering to the established technology constraints (HTML, CSS, Vanilla JavaScript, LocalStorage-only).

**Design Principles:**
- **Non-Breaking**: All enhancements integrate seamlessly with existing features
- **User-Centric**: Preferences persist across sessions for improved user experience
- **Accessibility-First**: Dark mode maintains WCAG 4.5:1 contrast ratios; UI remains keyboard navigable
- **Performance-Optimized**: No additional external dependencies; all features use vanilla JavaScript
- **Scalable**: Architecture supports future category and sorting enhancements

---

## Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Expense Visualizer                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                  UI Layer (HTML/CSS)                  │   │
│  │  ├─ Header (with Theme Toggle)                        │   │
│  │  ├─ Balance Display                                   │   │
│  │  ├─ Form Section (with Category Manager)              │   │
│  │  ├─ Transaction List (with Sort UI)                   │   │
│  │  ├─ Chart Component                                   │   │
│  │  └─ Footer                                            │   │
│  └──────────────────────────────────────────────────────┘   │
│                            ▲                                  │
│                            │                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Core Manager Modules                     │   │
│  │  ┌─────────────────────────────────────────────────┐ │   │
│  │  │ Theme Manager                                   │ │   │
│  │  │ ├─ toggleTheme()                                │ │   │
│  │  │ ├─ applyTheme(theme)                            │ │   │
│  │  │ ├─ loadThemePreference()                        │ │   │
│  │  │ └─ saveThemePreference()                        │ │   │
│  │  └─────────────────────────────────────────────────┘ │   │
│  │  ┌─────────────────────────────────────────────────┐ │   │
│  │  │ Category Manager                                │ │   │
│  │  │ ├─ addCustomCategory()                          │ │   │
│  │  │ ├─ deleteCustomCategory()                       │ │   │
│  │  │ ├─ getAllCategories()                           │ │   │
│  │  │ ├─ loadCustomCategories()                       │ │   │
│  │  │ └─ saveCustomCategories()                       │ │   │
│  │  └─────────────────────────────────────────────────┘ │   │
│  │  ┌─────────────────────────────────────────────────┐ │   │
│  │  │ Sort Manager                                    │ │   │
│  │  │ ├─ sortTransactions(option)                     │ │   │
│  │  │ ├─ getDisplayTransactions()                     │ │   │
│  │  │ ├─ loadSortPreference()                         │ │   │
│  │  │ └─ saveSortPreference()                         │ │   │
│  │  └─────────────────────────────────────────────────┘ │   │
│  │  ┌─────────────────────────────────────────────────┐ │   │
│  │  │ Storage Manager (Enhanced)                      │ │   │
│  │  │ ├─ saveCategoryData()                           │ │   │
│  │  │ ├─ loadCategoryData()                           │ │   │
│  │  │ ├─ saveSortPreference()                         │ │   │
│  │  │ └─ loadSortPreference()                         │ │   │
│  │  └─────────────────────────────────────────────────┘ │   │
│  │  ┌─────────────────────────────────────────────────┐ │   │
│  │  │ Transaction Manager (Unchanged)                 │ │   │
│  │  │ ├─ create()                                     │ │   │
│  │  │ ├─ add()                                        │ │   │
│  │  │ ├─ delete()                                     │ │   │
│  │  │ └─ getByCategory()                              │ │   │
│  │  └─────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────┘   │
│                            ▲                                  │
│                            │                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │        LocalStorage Persistence Layer                │   │
│  │  Key: "theme_preference"       → Theme selection    │   │
│  │  Key: "expense_categories"     → Custom categories  │   │
│  │  Key: "transaction_sort_preference" → Sort option   │   │
│  │  Key: "expenses_transactions"  → Transaction data   │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

**User Interaction Flow:**
1. User interacts with UI (adds category, changes theme, selects sort option)
2. Event handler routes to appropriate Manager module
3. Manager validates input and updates data
4. Storage Manager persists changes to LocalStorage
5. APP_STATE is updated
6. UI components re-render with new data

---

## Components and Interfaces

### 1. Theme Manager Module

**Responsibility:** Manages application theme switching and persistence

**Public Interface:**
```javascript
ThemeManager = {
    // Initialize theme on app startup
    initialize(): void
    
    // Toggle between light and dark themes
    toggleTheme(): void
    
    // Apply a specific theme
    applyTheme(themeName: 'light' | 'dark'): void
    
    // Get current theme
    getCurrentTheme(): 'light' | 'dark'
    
    // Load theme preference from storage
    loadThemePreference(): 'light' | 'dark'
    
    // Save theme preference to storage
    saveThemePreference(theme: 'light' | 'dark'): boolean
}
```

**Key Features:**
- Reads `theme_preference` from LocalStorage on startup
- Defaults to 'light' if no preference exists
- Applies CSS class to `<body>` to trigger theme-specific styles
- Renders theme toggle button in header
- Persists user selection immediately on change

**Implementation Details:**
- Applies `.theme-dark` class to body element when dark mode is active
- All color transformations handled in CSS (no runtime color manipulation)
- Theme toggle button accessible via keyboard (Tab + Enter)
- Respects system `prefers-color-scheme` as secondary fallback

### 2. Category Manager Module

**Responsibility:** Manages custom category creation, validation, and persistence

**Public Interface:**
```javascript
CategoryManager = {
    // Initialize custom categories on app startup
    initialize(): void
    
    // Get all categories (default + custom)
    getAllCategories(): string[]
    
    // Add a new custom category
    addCustomCategory(categoryName: string): {success: boolean, error?: string}
    
    // Delete a custom category if not in use
    deleteCustomCategory(categoryName: string): {success: boolean, error?: string}
    
    // Check if category is custom
    isCustomCategory(categoryName: string): boolean
    
    // Check how many transactions use a category
    getCategoryUsageCount(categoryName: string): number
    
    // Load custom categories from storage
    loadCustomCategories(): string[]
    
    // Save custom categories to storage
    saveCustomCategories(): boolean
    
    // Get all available custom categories
    getCustomCategories(): string[]
}
```

**Key Features:**
- Validates category names: non-empty, max 50 characters, no duplicates
- Prevents deletion of categories with existing transactions
- Maintains list of default categories (Food, Transport, Fun)
- Provides filtered dropdown in form for category selection
- Updates category dropdown dynamically when custom categories change

**Validation Rules:**
- Category name must not be empty
- Category name must not exceed 50 characters
- Category name must not duplicate existing categories (case-insensitive)
- Category name cannot be a default category

### 3. Sort Manager Module

**Responsibility:** Manages transaction sorting preferences and display order

**Public Interface:**
```javascript
SortManager = {
    // Initialize sort preference on app startup
    initialize(): void
    
    // Apply a sort option
    setSortOption(option: 'chronological' | 'amount-asc' | 'amount-desc' | 'category'): void
    
    // Get current sort option
    getSortOption(): string
    
    // Get transactions in sorted order
    getDisplayTransactions(transactions: Transaction[]): Transaction[]
    
    // Load sort preference from storage
    loadSortPreference(): string
    
    // Save sort preference to storage
    saveSortPreference(option: string): boolean
}
```

**Sort Options:**
- `chronological` - Newest transactions first (default)
- `amount-asc` - Ascending by amount (lowest first)
- `amount-desc` - Descending by amount (highest first)
- `category` - Alphabetically by category, then by amount descending

**Key Features:**
- Default sort order: Chronological (newest first)
- Sort preference persists across sessions
- UI shows selected sort option (visual indicator)
- Sorting happens in-memory (no storage modifications)
- When sorting by category, maintains consistent sub-ordering by amount

### 4. Enhanced Storage Manager

**Responsibility:** Persist all application state including new data types

**New Methods:**
```javascript
StorageManager = {
    // ... existing methods unchanged ...
    
    // Save custom categories
    saveCustomCategories(categories: string[]): boolean
    
    // Load custom categories
    loadCustomCategories(): string[]
    
    // Save sort preference
    saveSortPreference(option: string): boolean
    
    // Load sort preference
    loadSortPreference(): string
    
    // Save theme preference
    saveThemePreference(theme: string): boolean
    
    // Load theme preference
    loadThemePreference(): string
}
```

**Storage Keys:**
| Key | Purpose | Value Type | Example |
|-----|---------|-----------|---------|
| `expenses_transactions` | Transaction list | JSON array | `[{id, name, amount, category, timestamp}]` |
| `expense_categories` | Custom categories | JSON array | `["Groceries", "Utilities", "Entertainment"]` |
| `transaction_sort_preference` | Sort option | String | `"amount-desc"` |
| `theme_preference` | Theme selection | String | `"dark"` |

---

## Data Models

### Transaction Model (Unchanged)
```javascript
{
    id: string (UUID),
    name: string,
    amount: number (2 decimal places),
    category: string (default or custom),
    timestamp: number (milliseconds since epoch)
}
```

### Category Data Model
```javascript
{
    defaultCategories: ['Food', 'Transport', 'Fun'],
    customCategories: string[] // User-created categories
}
```

### Sort Preference Model
```javascript
{
    option: 'chronological' | 'amount-asc' | 'amount-desc' | 'category',
    appliedAt: number (timestamp)
}
```

### Theme Model
```javascript
{
    current: 'light' | 'dark',
    appliedAt: number (timestamp)
}
```

### APP_STATE Enhancement
```javascript
APP_STATE = {
    transactions: Transaction[],
    customCategories: string[],
    currentTheme: 'light' | 'dark',
    currentSortOption: string,
    storageAvailable: boolean,
    isLoading: boolean,
    errorMessage: string | null
}
```

---

## UI Component Specifications

### 1. Header with Theme Toggle

**HTML Structure:**
```html
<header>
    <div class="header-content">
        <h1>Expense & Budget Visualizer</h1>
        <button id="theme-toggle" class="theme-toggle" 
                aria-label="Toggle dark/light mode" 
                title="Toggle Theme">
            <span class="theme-icon">🌙</span>
        </button>
    </div>
</header>
```

**Styling Considerations:**
- Icon changes based on theme (☀️ for light, 🌙 for dark)
- Button positioned top-right of header
- Minimum 44x44px touch target
- Keyboard accessible (Tab navigation)

### 2. Enhanced Category Selection

**HTML Structure (Modified):**
```html
<div class="form-group">
    <label for="category">Category</label>
    <div class="category-input-group">
        <select id="category" required>
            <option value="">Select Category</option>
            <!-- Options populated dynamically -->
        </select>
        <button type="button" id="add-category-btn" 
                class="add-category-btn" 
                aria-label="Create new category">
            +
        </button>
    </div>
    <div id="add-category-form" class="add-category-form hidden">
        <input type="text" id="new-category-name" 
               placeholder="Enter category name" 
               maxlength="50"
               required>
        <button type="button" id="confirm-category-btn" 
                class="confirm-btn">
            Create
        </button>
        <button type="button" id="cancel-category-btn" 
                class="cancel-btn">
            Cancel
        </button>
        <div id="category-error" class="category-error hidden"></div>
    </div>
</div>
```

**Dynamic Features:**
- Category dropdown populated at runtime with default + custom categories
- Add category form toggles on "+" button click
- Delete icons appear next to custom categories in dropdown
- Error messages display inline for category validation failures

### 3. Transaction List with Sort Controls

**HTML Structure (New):**
```html
<section class="transaction-section">
    <div class="transaction-header">
        <h2>Transactions</h2>
        <div class="sort-controls">
            <label for="sort-select">Sort by:</label>
            <select id="sort-select">
                <option value="chronological">Newest First</option>
                <option value="amount-desc">Amount (High to Low)</option>
                <option value="amount-asc">Amount (Low to High)</option>
                <option value="category">Category (A-Z)</option>
            </select>
        </div>
    </div>
    <div id="transaction-list-container">
        <!-- Sorted transactions rendered here -->
    </div>
</section>
```

**Dynamic Behavior:**
- Sort dropdown reflects current saved preference on load
- Transaction list updates immediately on sort selection
- Selected sort option visually highlighted

### 4. CSS Theme Variables

**Dark Mode (`.theme-dark` on body):**
```css
--bg-primary: #1a1a1a;
--bg-secondary: #2d2d2d;
--text-primary: #e0e0e0;
--text-secondary: #b0b0b0;
--border-color: #404040;
--balance-gradient: linear-gradient(135deg, #483d8b 0%, #1a1a2e 100%);
--input-bg: #2d2d2d;
--input-border: #404040;
```

**Light Mode (default):**
```css
--bg-primary: #f5f5f5;
--bg-secondary: #ffffff;
--text-primary: #333;
--text-secondary: #666;
--border-color: #e0e0e0;
--balance-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
--input-bg: #ffffff;
--input-border: #bdc3c7;
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Custom Category Validation

*For any* category name submitted by the user, the category SHALL be accepted if and only if: (1) it is not empty, (2) it does not exceed 50 characters, (3) it does not duplicate any existing category (case-insensitive), and (4) it is not a default category.

**Validates: Requirements 1.3, 1.4**

### Property 2: Category Persistence Round-Trip

*For any* valid custom category name, after creation and storage, the category SHALL be retrievable from local storage, and upon application reload (simulated by calling load functions), SHALL appear in the available categories list.

**Validates: Requirements 1.5, 1.6, 9.1, 9.3**

### Property 3: Custom Categories in Transactions

*For any* transaction created with a custom category (instead of a default category), the transaction SHALL be stored identically to transactions with default categories, SHALL calculate correctly in total balance, and SHALL appear in the chart data with the custom category label.

**Validates: Requirements 1.7, 1.8, 12.2, 12.3**

### Property 4: Category Usage Detection

*For any* custom category that is referenced by one or more existing transactions, attempting to delete that category SHALL fail with an error message indicating the usage count, and the category SHALL remain in storage.

**Validates: Requirements 2.2, 2.3**

### Property 5: Category Deletion

*For any* custom category that is not referenced by any transactions, after deletion, the category SHALL be removed from local storage and SHALL no longer appear in the categories dropdown.

**Validates: Requirements 2.5, 2.6**

### Property 6: Amount Ascending Sort

*For any* set of transactions with varying amounts, applying ascending amount sort SHALL reorder the transactions so that for all adjacent pairs (t1, t2), t1.amount ≤ t2.amount.

**Validates: Requirements 3.2**

### Property 7: Amount Descending Sort

*For any* set of transactions with varying amounts, applying descending amount sort SHALL reorder the transactions so that for all adjacent pairs (t1, t2), t1.amount ≥ t2.amount.

**Validates: Requirements 3.3**

### Property 8: Category Alphabetical Sort

*For any* set of transactions with varying categories, applying alphabetical category sort SHALL reorder transactions so that: (1) transactions are grouped by category in alphabetical order, and (2) within each category group, transactions are ordered by amount descending.

**Validates: Requirements 4.2, 4.4**

### Property 9: Sort Preference Persistence

*For any* sort option selected by the user, after selection, the option SHALL be saved to local storage with key "transaction_sort_preference", and upon application reload (simulated), the same sort option SHALL be automatically applied to the transaction list.

**Validates: Requirements 3.4, 3.5, 4.3, 4.5, 10.1, 10.3**

### Property 10: Theme Toggle Behavior

*For any* current theme state (light or dark), clicking the theme toggle SHALL switch to the opposite theme, and clicking again SHALL return to the original theme. This SHALL hold true across multiple toggles.

**Validates: Requirements 5.2**

### Property 11: Theme Persistence

*For any* theme selected by the user (light or dark), the theme SHALL be saved to local storage with key "theme_preference", and upon application reload (simulated), the saved theme SHALL be automatically applied. If no preference is saved, light theme SHALL be applied by default.

**Validates: Requirements 5.4, 5.5, 5.6, 11.1, 11.2, 11.3**

### Property 12: Theme Application to DOM

*For any* theme change, the appropriate theme CSS class (`.theme-dark` for dark, or absence of class for light) SHALL be applied to the body element, and this CSS class SHALL persist for the duration of the session.

**Validates: Requirements 5.3, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8**

### Property 13: Backward Compatibility with Default Categories

*For any* transaction created with a default category (Food, Transport, Fun) in the presence of custom categories, the transaction SHALL process identically to the existing implementation without custom categories, SHALL calculate correctly in total balance, and SHALL display correctly in the chart.

**Validates: Requirements 12.1, 12.3, 12.4, 12.5, 12.6**

---

## Error Handling

### Category-Related Errors

| Error Scenario | Error Message | Severity | Recovery |
|---|---|---|---|
| Empty category name | "Category name cannot be empty" | User Input | Clear field, prompt retry |
| Category name > 50 chars | "Category name must not exceed 50 characters" | User Input | Truncate input, suggest valid name |
| Duplicate category name | "This category already exists" | User Input | Suggest alternative name |
| Attempt to delete used category | "Cannot delete category. X transactions use this category." | Business Logic | Show affected transactions |
| Storage full (category save) | "Storage limit exceeded. Cannot save category." | System | Clear old data or inform user |

### Sort-Related Errors

| Error Scenario | Error Message | Severity | Recovery |
|---|---|---|---|
| Invalid sort option | Falls back to chronological sort | System | No user feedback needed |
| Storage full (sort save) | "Sort preference could not be saved" | System | Use session-only preference |
| Corrupted sort data | Defaults to chronological | System | Automatic recovery |

### Theme-Related Errors

| Error Scenario | Error Message | Severity | Recovery |
|---|---|---|---|
| Storage full (theme save) | "Theme preference could not be saved" | System | Use session-only preference |
| Invalid theme value | Defaults to light | System | Automatic recovery |

### Storage Errors

| Error Scenario | Error Message | Severity | Recovery |
|---|---|---|---|
| LocalStorage unavailable | "Local Storage is disabled. Your changes won't be saved." | System | Display at app start; app remains functional |
| QuotaExceededError | "Storage limit exceeded. Please delete some transactions." | System | Prompt user to free space |
| JSON parsing error | Silent recovery | System | Load empty data structure |

---

## Testing Strategy

### Dual Testing Approach

This feature requires both **unit tests** and **property-based tests** for comprehensive coverage:

#### Unit Tests (Example-Based)

Test specific scenarios, edge cases, and integration points:

1. **Theme Toggle Button Visibility**
   - Verify theme toggle button exists in header
   - Verify button is keyboard accessible

2. **Sort Controls Visibility**
   - Verify sort dropdown exists in transaction section
   - Verify all sort options are available

3. **Category Management UI**
   - Verify "+" button appears next to category select
   - Verify add category form can be toggled
   - Verify delete buttons appear for custom categories
   - Verify confirmation dialogs appear on delete

4. **Default Theme on First Load**
   - Test that light theme applies when no preference exists

5. **Confirmation Dialogs**
   - Test that confirmation dialog appears before deleting unused category
   - Test that error dialog appears when attempting to delete used category

6. **Storage Error Handling**
   - Test behavior when localStorage is full
   - Test behavior when localStorage is unavailable
   - Test error message display

#### Property-Based Tests (100+ iterations minimum)

Test universal properties across randomized inputs:

**Theme Manager Properties:**
- Theme toggle cycles between light and dark (Property 10)
- Theme persistence and reload (Property 11)
- Theme class applied to DOM (Property 12)

**Category Manager Properties:**
- Category name validation rules (Property 1)
- Category persistence round-trip (Property 2)
- Custom categories work in transactions (Property 3)
- Category usage detection (Property 4)
- Category deletion removes from storage (Property 5)

**Sort Manager Properties:**
- Amount ascending sort correctness (Property 6)
- Amount descending sort correctness (Property 7)
- Category alphabetical sort with sub-ordering (Property 8)
- Sort preference persistence (Property 9)

**Backward Compatibility:**
- Default categories function unchanged (Property 13)
- Transaction calculations with default categories (Property 13)

### Property Test Configuration

Each property-based test SHALL:
- Run a minimum of 100 iterations with randomized inputs
- Include a comment referencing the design property
- Tag format: `// Feature: expense-budget-visualizer-enhancements, Property N: [Title]`
- Use appropriate generators for input variety:
  - Category names: random strings, edge cases (empty, max length, duplicates)
  - Transactions: random amounts, mixed categories, timestamps
  - Sort options: all defined sort types
  - Theme states: both light and dark

### Integration Testing

Test the interaction between enhanced features and existing functionality:

1. Create custom category → add transaction → verify chart updates
2. Create category → sort by category → verify sort works
3. Switch to dark mode → add transaction → verify styling applies
4. Delete all transactions → verify category remains → add new transaction
5. Switch theme → reload → verify theme persists with custom categories
6. Apply sort → add new transaction → verify new transaction appears in correct position

### Manual/Visual Testing

Some requirements require manual verification (not automated):

1. **Dark Mode Colors** - Verify WCAG 4.5:1 contrast ratios
2. **Light Mode Styling** - Verify consistency with original design
3. **Theme Application Consistency** - Verify all components respect theme
4. **Responsive Design** - Verify dark/light modes work on mobile/tablet/desktop

---

## Implementation Sequence

To minimize risk and ensure non-breaking changes, implement features in this order:

1. **Storage Manager Enhancement** (Step 1)
   - Add storage keys for new data types
   - Implement save/load methods for categories, sort, theme

2. **Theme Manager Module** (Step 2)
   - Implement toggle, persistence, and CSS class application
   - Add theme toggle button to header
   - Add CSS for dark mode theme

3. **Category Manager Module** (Step 3)
   - Implement validation, add, delete, persistence
   - Enhance category dropdown UI
   - Add custom category form

4. **Sort Manager Module** (Step 4)
   - Implement all sort algorithms
   - Add sort controls UI
   - Test persistence with existing transactions

5. **Integration Testing** (Step 5)
   - Verify features work together
   - Test with existing data
   - Performance testing with large datasets

---

## Performance Considerations

- **Sorting**: Implemented in-memory (O(n log n)); no additional storage overhead
- **Theme Application**: CSS class toggle (O(1)); no layout thrashing
- **Category Validation**: String comparison (O(n) where n = category name length)
- **Storage Operations**: Leverages existing StorageManager; no additional I/O

**Optimization Notes:**
- Category lookup uses Set for O(1) duplicate detection (optional enhancement)
- Sort cache could be implemented to avoid re-sorting on page interaction
- Theme toggle uses CSS-in-JS to avoid multiple DOM queries

---

## Accessibility Considerations

1. **Theme Toggle Button**
   - Accessible via Tab key
   - Clear aria-label: "Toggle dark/light mode"
   - Tooltip shows current theme and next action

2. **Category Management**
   - All form fields have associated labels
   - Error messages use role="alert" for screen readers
   - Keyboard navigation through all controls

3. **Sort Controls**
   - Sort dropdown accessible via Tab and arrow keys
   - Visual indicator shows currently applied sort
   - ARIA attributes indicate selected option

4. **Theme Contrast**
   - Dark mode: 4.5:1 contrast minimum (WCAG AA)
   - Light mode: Maintains existing 7:1+ contrast
   - High contrast mode support via CSS media query

5. **Motion**
   - Respects `prefers-reduced-motion` (existing implementation)
   - Theme toggle has minimal motion
   - No auto-animations on sort or category changes

---

## Security Considerations

1. **Input Validation**
   - Category names sanitized (length, character validation)
   - XSS protection via HTML escaping in DOM operations
   - Theme and sort options validated against known values

2. **Storage Security**
   - No sensitive data stored in localStorage
   - JSON serialization used (built-in security)
   - No custom encryption needed for this use case

3. **DOM Integrity**
   - Uses `textContent` instead of `innerHTML` for category names
   - CSS class names hard-coded (not user input)
   - Event handlers properly scoped

---

## Browser Compatibility

Tested and supported in:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Features used:**
- LocalStorage API (all browsers)
- CSS custom properties / variables (all modern browsers)
- ES6 syntax (all supported)
- No polyfills required

---

## Future Enhancement Opportunities

1. **Category Icons** - Allow users to assign icons to custom categories
2. **Category Colors** - Allow custom colors for category badges
3. **Advanced Sorting** - Add filters, multi-level sort, date range sorting
4. **Theme Customization** - Allow users to create custom themes
5. **Category Export/Import** - Share category configurations
6. **Sort Presets** - Save and name custom sort combinations
7. **Auto Theme** - Respect system `prefers-color-scheme` setting
8. **Scheduled Sort** - Automatically apply sort at specific times
