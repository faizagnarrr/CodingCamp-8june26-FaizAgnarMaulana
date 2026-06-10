# Implementation Plan: Expense & Budget Visualizer Enhancements

## Overview

Implementation approach untuk tiga enhancement features (Custom Categories, Transaction Sorting, Dark/Light Mode) pada existing Expense & Budget Visualizer application. Implementasi menggunakan Vanilla JavaScript dengan struktur modular untuk memastikan non-breaking changes dan seamless integration.

**Key Principles:**
- Maintain backward compatibility dengan existing features
- Modular architecture dengan manager modules terpisah
- Persistent state di LocalStorage
- Incremental implementation tanpa disruption

---

## Tasks

### Phase 1: Foundation - Storage & State Management

- [ ] 1. Enhance Storage Manager untuk support custom categories, sort preferences, dan theme preference
  - [ ] 1.1 Extend StorageManager dengan methods untuk custom categories
    - Tambahkan `saveCustomCategories()`, `loadCustomCategories()` ke StorageManager
    - Update CONFIG dengan storage key baru: "expense_categories", "transaction_sort_preference", "theme_preference"
    - Maintain backward compatibility dengan existing "expenses_transactions" key
    - _Requirements: 1.5, 1.6, 9.1, 9.3, 10.1, 10.3, 11.1, 11.2, 11.3_

  - [ ] 1.2 Extend StorageManager untuk sort preference dan theme persistence
    - Tambahkan `saveSortPreference()`, `loadSortPreference()` ke StorageManager
    - Tambahkan `saveThemePreference()`, `loadThemePreference()` ke StorageManager
    - Implementasikan error handling untuk QuotaExceededError dan missing data
    - _Requirements: 10.1, 11.1_

  - [ ] 1.3 Extend APP_STATE dengan new fields untuk enhancements
    - Tambahkan `customCategories: []` field ke APP_STATE
    - Tambahkan `currentTheme: 'light'` field ke APP_STATE
    - Tambahkan `currentSortOption: 'chronological'` field ke APP_STATE
    - _Requirements: 3.4, 5.4, 9.1, 10.1, 11.1_

---

### Phase 2: Theme Manager Module - Dark/Light Mode Toggle

- [ ] 2. Implement Theme Manager module untuk theme switching dan persistence
  - [ ] 2.1 Create ThemeManager module dengan toggle dan persistence methods
    - Buat ThemeManager object dengan methods: `initialize()`, `toggleTheme()`, `applyTheme()`, `getCurrentTheme()`, `loadThemePreference()`, `saveThemePreference()`
    - Implementasikan logic untuk default ke 'light' jika tidak ada preference
    - Store current theme di APP_STATE
    - _Requirements: 5.2, 5.4, 5.5, 5.6, 11.1, 11.2, 11.3_

  - [ ] 2.2 Implement theme application ke DOM element
    - Tambahkan logic untuk apply `.theme-dark` class ke `<body>` ketika dark mode active
    - Remove class ketika light mode active
    - Test bahwa class persistent selama session
    - _Requirements: 5.3, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8_

  - [ ] 2.3 Create theme toggle button di header
    - Tambahkan theme toggle button ke header section di index.html
    - Button harus accessible: min 44x44px, keyboard navigable (Tab + Enter)
    - Icon berubah: 🌙 untuk light mode (klik untuk dark), ☀️ untuk dark mode (klik untuk light)
    - Attach event listener untuk toggle theme
    - _Requirements: 5.1, 5.2_

  - [ ]* 2.4 Write property tests untuk Theme Manager
    - **Property 10: Theme Toggle Behavior** - Verify theme cycles between light/dark
    - **Property 11: Theme Persistence** - Verify theme saved/loaded correctly
    - **Property 12: Theme Application to DOM** - Verify `.theme-dark` class applied correctly
    - **Validates: Requirements 5.2, 5.3, 5.4, 5.5, 5.6, 8.1-8.8, 11.1-11.3**

---

### Phase 3: Category Manager Module - Custom Categories

- [ ] 3. Implement CategoryManager module untuk custom category management
  - [ ] 3.1 Create CategoryManager module dengan validation dan persistence
    - Buat CategoryManager object dengan methods: `initialize()`, `getAllCategories()`, `addCustomCategory()`, `deleteCustomCategory()`, `isCustomCategory()`, `getCategoryUsageCount()`, `loadCustomCategories()`, `saveCustomCategories()`, `getCustomCategories()`
    - Maintain list default categories: ['Food', 'Transport', 'Fun']
    - Implement category validation: not empty, max 50 chars, no duplicates (case-insensitive), not default category
    - Load custom categories pada app initialize
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.6, 9.1, 9.3_

  - [ ] 3.2 Enhance ValidationEngine untuk support custom category validation
    - Tambahkan `validateCategoryName()` ke ValidationEngine
    - Check: not empty, max 50 characters, not duplicate, not default category
    - Return validation result object dengan error message
    - _Requirements: 1.3, 1.4_

  - [ ] 3.3 Enhance TransactionManager untuk support custom categories
    - Update `validateCategory()` di ValidationEngine untuk accept custom categories
    - Modify `validateFormInput()` untuk accept custom categories
    - Ensure transactions dengan custom categories proses identically ke default categories
    - _Requirements: 1.7, 1.8, 12.2, 12.3_

  - [ ] 3.4 Create enhanced category dropdown UI dengan custom category management
    - Modify category select element di form untuk dynamically populate options dari getAllCategories()
    - Tambahkan "+" button next to category select untuk add category feature
    - Create hidden form untuk custom category input (input field + Confirm/Cancel buttons)
    - Implement toggle behavior: "+" button shows/hides add category form
    - _Requirements: 1.2, 1.3_

  - [ ] 3.5 Implement add custom category feature
    - Attach event listener ke Confirm button
    - Get value dari input field, validate, call CategoryManager.addCustomCategory()
    - On success: refresh category dropdown options, clear input, hide form, show success state
    - On failure: display error message inline
    - _Requirements: 1.3, 1.4, 1.5_

  - [ ] 3.6 Implement delete custom category feature
    - Add delete icon next to each custom category (bukan default category)
    - On delete button click: check usage dengan getCategoryUsageCount()
    - If used by transactions: show error dialog dengan usage count
    - If not used: show confirmation dialog → on confirm, delete via CategoryManager.deleteCustomCategory()
    - Refresh UI after successful deletion
    - _Requirements: 2.1, 2.2, 2.3, 2.5, 2.6_

  - [ ] 3.7 Update chart component untuk display custom categories
    - Ensure updateChartDisplay() works dengan custom categories
    - Assign default colors untuk custom categories (fallback ke neutral color jika tidak ada predefined)
    - Test bahwa chart includes custom category totals correctly
    - _Requirements: 1.8, 12.3_

  - [ ]* 3.8 Write property tests untuk Category Manager
    - **Property 1: Custom Category Validation** - Verify validation rules enforce correctly
    - **Property 2: Category Persistence Round-Trip** - Verify categories persist and reload
    - **Property 3: Custom Categories in Transactions** - Verify custom categories work in transactions
    - **Property 4: Category Usage Detection** - Verify usage check prevents deletion
    - **Property 5: Category Deletion** - Verify deletion removes category from storage
    - **Validates: Requirements 1.3-1.8, 2.2, 2.3, 2.5, 2.6, 9.1, 9.3, 12.1-12.6**

---

### Phase 4: Sort Manager Module - Transaction Sorting

- [ ] 4. Implement SortManager module untuk transaction sorting dengan persistence
  - [ ] 4.1 Create SortManager module dengan sort algorithms
    - Buat SortManager object dengan methods: `initialize()`, `setSortOption()`, `getSortOption()`, `getDisplayTransactions()`, `loadSortPreference()`, `saveSortPreference()`
    - Define sort options: 'chronological', 'amount-asc', 'amount-desc', 'category'
    - Default sort: 'chronological' (newest first)
    - Implement sorting in-memory tanpa modify storage
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ] 4.2 Implement sort algorithms untuk setiap sort option
    - Amount ascending: sort by amount dari smallest ke largest
    - Amount descending: sort by amount dari largest ke smallest
    - Category alphabetical: group by category A-Z, then sort by amount descending within each group
    - Chronological: sort by timestamp newest first (existing behavior)
    - _Requirements: 3.2, 3.3, 4.2, 4.4_

  - [ ] 4.3 Create sort controls UI di transaction section
    - Tambahkan sort dropdown di transaction section header (label + select)
    - Populate select dengan 4 sort options: "Newest First", "Amount (High to Low)", "Amount (Low to High)", "Category (A-Z)"
    - Load saved sort preference on app initialize, display as selected option
    - _Requirements: 3.1, 4.1_

  - [ ] 4.4 Implement sort selection event handler
    - Attach change event listener ke sort dropdown
    - On selection change: call SortManager.setSortOption() dengan selected value
    - Call SortManager.saveSortPreference() untuk persist choice
    - Call renderTransactionList() untuk update UI dengan sorted transactions
    - Add visual indicator untuk selected sort option (optional: highlight atau styling)
    - _Requirements: 3.4, 3.5, 4.3, 4.5_

  - [ ] 4.5 Update renderTransactionList() untuk use SortManager
    - Modify renderTransactionList() untuk call getDisplayTransactions() dari SortManager
    - Ensure transactions rendered dalam sort order sesuai current preference
    - Test bahwa sort applied correctly ketika transactions ditambah/dihapus
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 4.4_

  - [ ]* 4.6 Write property tests untuk Sort Manager
    - **Property 6: Amount Ascending Sort** - Verify transactions sorted ascending by amount
    - **Property 7: Amount Descending Sort** - Verify transactions sorted descending by amount
    - **Property 8: Category Alphabetical Sort** - Verify transactions grouped by category A-Z, then by amount desc
    - **Property 9: Sort Preference Persistence** - Verify sort preference saved/loaded correctly
    - **Validates: Requirements 3.2, 3.3, 3.4, 3.5, 4.2, 4.3, 4.4, 4.5, 10.1, 10.3**

---

### Phase 5: CSS Theme Styling - Dark/Light Mode Colors

- [ ] 5. Implement CSS theme styles untuk dark dan light modes
  - [ ] 5.1 Create CSS custom properties (variables) untuk theme colors
    - Define light mode variables: --bg-primary (#f5f5f5), --bg-secondary (#fff), --text-primary (#333), --text-secondary (#666), --border-color (#e0e0e0), --input-bg (#fff), --input-border (#bdc3c7)
    - Define dark mode variables di `.theme-dark` selector: --bg-primary (#1a1a1a), --bg-secondary (#2d2d2d), --text-primary (#e0e0e0), --text-secondary (#b0b0b0), --border-color (#404040), --input-bg (#2d2d2d), --input-border (#404040)
    - Add ke css/styles.css
    - _Requirements: 6.1, 6.2, 7.1, 7.2_

  - [ ] 5.2 Apply CSS variables ke existing color definitions
    - Update body background: use var(--bg-primary)
    - Update all text colors: use var(--text-primary) dan var(--text-secondary)
    - Update all form inputs: use var(--input-bg) dan var(--input-border)
    - Update section backgrounds: use var(--bg-secondary)
    - Update borders: use var(--border-color)
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.8, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 8.1-8.8_

  - [ ] 5.3 Update balance display gradient untuk dark mode
    - Define gradient untuk light mode: 135deg, #667eea 0%, #764ba2 100% (existing)
    - Define gradient untuk dark mode: 135deg, #483d8b 0%, #1a1a2e 100%
    - Apply dengan CSS variable --balance-gradient
    - _Requirements: 6.4, 7.4_

  - [ ] 5.4 Update category badge colors untuk dark mode
    - Ensure category badges (.food, .transport, .fun) maintain sufficient contrast dalam dark mode
    - Update background colors untuk dark mode variant
    - Test WCAG 4.5:1 contrast ratio pada text labels
    - _Requirements: 6.6, 6.8, 8.8_

  - [ ] 5.5 Update chart colors untuk dark mode
    - Ensure chart colors (pie chart segments) visible pada dark background
    - Update category colors untuk dark mode: maintain brightness dan saturation
    - Test dalam updateChartDisplay() bahwa chart renders correctly
    - _Requirements: 6.6, 8.1_

  - [ ] 5.6 Update theme toggle button styling
    - Style theme toggle button dengan accessible size (44x44px minimum)
    - Update button colors untuk light dan dark modes
    - Ensure button text/icon remains readable dalam both modes
    - _Requirements: 5.1, 8.1-8.5_

  - [ ]* 5.7 Validate WCAG contrast ratios untuk accessibility
    - Verify dark mode text: 4.5:1 contrast minimum untuk normal text
    - Verify dark mode text: 3:1 contrast minimum untuk large text
    - Verify light mode maintains existing high contrast (7:1+)
    - Test dengan accessibility checker tool
    - _Requirements: 6.7, 8.1-8.8_

---

### Phase 6: Integration & Backward Compatibility

- [ ] 6. Integration testing dan ensure backward compatibility
  - [ ] 6.1 Initialize all managers pada app startup
    - Call ThemeManager.initialize(), CategoryManager.initialize(), SortManager.initialize() dalam initializeApp()
    - Load theme preference → apply theme
    - Load sort preference → set current sort option
    - Load custom categories → populate APP_STATE
    - Order matters: theme first (for UI), then categories, then sort
    - _Requirements: 9.1, 10.1, 11.1, 11.2_

  - [ ] 6.2 Update category dropdown population
    - Modify category select population untuk use CategoryManager.getAllCategories() instead of hardcoded list
    - Call getAll() untuk initial render
    - Setup event listeners untuk category changes (when user adds/deletes category)
    - _Requirements: 1.1, 1.2, 3.4_

  - [ ] 6.3 Test backward compatibility dengan default categories
    - Verify transactions dengan default categories (Food, Transport, Fun) work identically to before
    - Test chart displays default categories correctly
    - Test sorting dengan default categories works
    - Test theme toggle tidak affect transaction calculations
    - _Requirements: 12.1, 12.3, 12.4, 12.5, 12.6, 13_

  - [ ] 6.4 Test integration: custom categories + sorting + theme
    - Create custom category → add transaction dengan custom category → verify appears dalam sort/chart
    - Switch theme → verify custom category badges visible dan readable
    - Apply sort options → verify sort works dengan default + custom categories mixed
    - Delete transaction → verify category dropdown updates
    - _Requirements: 1.7, 1.8, 3.1, 5.2, 8.1_

  - [ ] 6.5 Handle localStorage errors gracefully
    - Test behavior ketika localStorage full (QuotaExceededError)
    - Display error message ke user: "Storage limit exceeded. Please delete some transactions."
    - Test behavior ketika localStorage disabled
    - Display error message: "Local Storage is disabled. Your changes won't be saved."
    - Ensure app remains functional meski storage unavailable
    - _Requirements: 9.4, 10.4, 11.4_

  - [ ] 6.6 Verify no breaking changes ke existing features
    - Existing transaction add/delete works without modification
    - Existing balance calculation works
    - Existing chart rendering works
    - Form validation untuk default categories unchanged
    - Empty state messages display correctly
    - _Requirements: 12.1, 12.3, 12.4, 12.5, 12.6_

---

### Phase 7: Testing - Unit & Property-Based Tests

- [ ] 7. Create comprehensive test suite untuk all managers
  - [ ] 7.1 Create test file structure
    - Create `/js/tests/` directory
    - Create `theme-manager.test.js` untuk ThemeManager tests
    - Create `category-manager.test.js` untuk CategoryManager tests
    - Create `sort-manager.test.js` untuk SortManager tests
    - Create `test-utils.js` dengan helper functions untuk test setup/teardown
    - _Requirements: Property tests validation_

  - [ ] 7.2 Write unit tests untuk ThemeManager
    - Test: toggleTheme() switches from light to dark
    - Test: toggleTheme() switches from dark to light
    - Test: getCurrentTheme() returns correct theme
    - Test: applyTheme() applies correct CSS class to body
    - Test: saveThemePreference() persists to localStorage
    - Test: loadThemePreference() loads from localStorage
    - Test: default theme is 'light' ketika no preference saved
    - _Requirements: 5.1, 5.2, 5.4, 5.5, 5.6_

  - [ ] 7.3 Write unit tests untuk CategoryManager
    - Test: addCustomCategory() accepts valid category
    - Test: addCustomCategory() rejects empty name
    - Test: addCustomCategory() rejects name > 50 chars
    - Test: addCustomCategory() rejects duplicate name (case-insensitive)
    - Test: addCustomCategory() rejects default category name
    - Test: deleteCustomCategory() removes category when not in use
    - Test: deleteCustomCategory() prevents deletion when in use
    - Test: getCategoryUsageCount() returns correct count
    - Test: getAllCategories() returns default + custom
    - Test: isCustomCategory() identifies custom correctly
    - _Requirements: 1.3, 1.4, 1.5, 1.6, 2.2, 2.3, 2.5_

  - [ ] 7.4 Write unit tests untuk SortManager
    - Test: setSortOption() updates current sort
    - Test: getSortOption() returns current sort
    - Test: getDisplayTransactions() returns sorted array untuk each option
    - Test: saveSortPreference() persists to localStorage
    - Test: loadSortPreference() loads from localStorage
    - Test: default sort is 'chronological'
    - _Requirements: 3.2, 3.3, 3.4, 4.2, 4.3, 4.4_

  - [ ] 7.5 Write property-based tests untuk correctness properties
    - Setup property test framework (use simple property testing approach)
    - Implement Property 1: Custom Category Validation
    - Implement Property 2: Category Persistence Round-Trip
    - Implement Property 3: Custom Categories in Transactions
    - Implement Property 4: Category Usage Detection
    - Implement Property 5: Category Deletion
    - Implement Property 6: Amount Ascending Sort
    - Implement Property 7: Amount Descending Sort
    - Implement Property 8: Category Alphabetical Sort
    - Implement Property 9: Sort Preference Persistence
    - Implement Property 10: Theme Toggle Behavior
    - Implement Property 11: Theme Persistence
    - Implement Property 12: Theme Application to DOM
    - Implement Property 13: Backward Compatibility with Default Categories
    - Each property test runs minimum 100 iterations dengan randomized inputs
    - _Requirements: All design correctness properties_

  - [ ] 7.6 Write integration tests
    - Test: create category → add transaction → verify chart includes custom category
    - Test: create category → apply sort by category → verify sort includes custom category
    - Test: switch theme → reload → verify theme persists
    - Test: create custom category → delete transaction → attempt delete category
    - Test: mix default + custom categories → apply different sorts → verify correct ordering
    - _Requirements: Integration scenarios_

---

### Phase 8: Final Checkpoint & Verification

- [ ] 8. Final checkpoint - Ensure all tests pass dan no breaking changes
  - Ensure all unit tests pass
  - Ensure all property-based tests pass (minimum 100 iterations each)
  - Run manual verification: theme toggle, category add/delete, sorting, persistence on reload
  - Test dalam multiple browsers: Chrome, Firefox, Safari (jika available)
  - Verify app functions correctly dengan existing data (backward compatibility)
  - Check localStorage quota handling
  - Verify accessibility: Tab navigation, screen reader compatibility, WCAG contrast ratios
  - Ask user if any questions arise or if adjustments needed

---

## Notes

- Tasks marked dengan `*` adalah optional testing tasks dan dapat diskip untuk faster MVP
- Setiap task reference specific requirements untuk traceability
- Implementation mengikuti incremental approach: storage → theme → categories → sorting → styling → integration → testing
- All enhancements integrate tanpa breaking existing features
- CustomCategories, SortPreference, dan ThemePreference persist ke localStorage dengan keys terpisah
- Default behavior (light mode, chronological sort, default categories) applies jika no preference saved
- Property-based tests validate universal correctness properties across 100+ randomized iterations

---

## Task Dependency Graph

```json
{
  "waves": [
    {
      "id": 0,
      "tasks": ["1.1", "1.2", "1.3"]
    },
    {
      "id": 1,
      "tasks": ["2.1", "2.2", "3.1", "3.2", "4.1"]
    },
    {
      "id": 2,
      "tasks": ["2.3", "2.4", "3.3", "3.4", "3.5", "4.2", "4.3"]
    },
    {
      "id": 3,
      "tasks": ["3.6", "3.7", "3.8", "4.4", "4.5", "4.6"]
    },
    {
      "id": 4,
      "tasks": ["5.1", "5.2", "5.3", "5.4", "5.5", "5.6", "5.7"]
    },
    {
      "id": 5,
      "tasks": ["6.1", "6.2", "6.3", "6.4", "6.5", "6.6"]
    },
    {
      "id": 6,
      "tasks": ["7.1", "7.2", "7.3", "7.4", "7.5", "7.6"]
    }
  ]
}
```
