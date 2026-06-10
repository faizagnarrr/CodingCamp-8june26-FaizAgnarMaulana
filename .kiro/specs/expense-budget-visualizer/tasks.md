# Implementation Plan: Expense & Budget Visualizer

## Overview

Implementasi aplikasi web Expense & Budget Visualizer secara incremental dari awal hingga selesai. Aplikasi ini akan dibangun dengan vanilla JavaScript, HTML5, dan CSS3 tanpa framework. Setiap task membangun pada task sebelumnya, dengan fokus pada integrasi kode untuk menghindari orphaned code.

## Tasks

- [ ] 1. Set up project structure and core infrastructure
  - Create project directory structure (index.html, css/styles.css, js/app.js)
  - Create index.html with semantic HTML5 structure including all components (form, transaction list, balance display, chart container)
  - Import CSS and JavaScript files
  - Set up form HTML with input fields (Item Name, Amount) and category dropdown (Food, Transport, Fun)
  - Set up transaction list container with empty state message
  - Set up balance display container with label and amount display
  - Set up chart component container with canvas element
  - Create basic CSS layout structure for mobile-first responsive design (320px minimum)
  - _Requirements: 9.1, 9.5, 11.1, 11.3, 11.5, 11.6, 11.7_

- [ ] 2. Implement validation engine
  - [ ] 2.1 Create ValidationEngine module with item name validation function
    - Implement validation that accepts non-empty strings with at least one non-whitespace character, max 100 characters
    - Return true/false and error message
    - _Requirements: 1.3, 1.5, 2.4_

  - [ ] 2.2 Write property test for item name validation
    - **Property 1: Item Name Validation**
    - **Validates: Requirements 1.3, 1.5**

  - [ ] 2.3 Create ValidationEngine module with amount validation function
    - Implement validation for positive numbers between 0.01-999999.99 with max 2 decimal places
    - Return true/false and error message
    - _Requirements: 1.2, 1.6, 2.4_

  - [ ] 2.4 Write property test for amount validation
    - **Property 2: Amount Validation Range and Precision**
    - **Validates: Requirements 1.2, 1.6, 2.4**

  - [ ] 2.5 Create ValidationEngine module with category validation function
    - Implement validation that category is one of: Food, Transport, Fun
    - Return true/false and error message
    - _Requirements: 1.4, 1.7, 2.4_

  - [ ] 2.6 Write property test for category validation
    - **Property 3: Category Validation**
    - **Validates: Requirements 1.4, 1.7**

  - [ ] 2.7 Integrate validation into form submission
    - Wire form submission to run all validations
    - Display error messages in error message div
    - Clear previous error messages when user retries
    - _Requirements: 1.5, 1.6, 1.7, 1.8, 1.12_

- [ ] 3. Implement transaction manager and data models
  - [ ] 3.1 Create Transaction object structure
    - Generate UUID for each transaction
    - Store id, name, amount, category, timestamp
    - _Requirements: 6.1_

  - [ ] 3.2 Write property test for unique ID generation
    - **Property 10: Transaction Unique Identifier Generation**
    - **Validates: Requirements 6.1**

  - [ ] 3.3 Create TransactionManager module with create method
    - Accept validated item name, amount, category
    - Create Transaction object with generated UUID and current timestamp
    - Store in memory array
    - _Requirements: 1.9, 6.1, 6.2_

  - [ ] 3.4 Write property test for transaction creation
    - **Property 4: Transaction Creation with Valid Input**
    - **Validates: Requirements 1.9**

  - [ ] 3.5 Create TransactionManager delete method
    - Accept transaction ID
    - Remove transaction from memory array
    - _Requirements: 3.3_

  - [ ] 3.6 Implement transaction ordering preservation
    - Ensure transactions are stored in creation order (FIFO)
    - Most recent transaction appears last
    - _Requirements: 2.7_

  - [ ] 3.7 Write property test for transaction list ordering
    - **Property 11: Transaction List Order Preservation**
    - **Validates: Requirements 2.7**

- [ ] 4. Implement Local Storage persistence
  - [ ] 4.1 Create StorageManager module with loadAll method
    - Load transactions from Local Storage on app initialization
    - Handle empty Local Storage (initialize with empty array)
    - Validate JSON integrity
    - _Requirements: 6.4, 6.5, 6.6_

  - [ ] 4.2 Create StorageManager module with save method
    - Serialize transaction and store in Local Storage
    - Handle quota exceeded errors with user error message
    - _Requirements: 6.2, 6.7_

  - [ ] 4.3 Create StorageManager module with delete method
    - Remove transaction from Local Storage by ID
    - Handle deletion errors with user error message
    - _Requirements: 6.3, 3.7_

  - [ ] 4.4 Write property test for persistence round-trip
    - **Property 12: Transaction Persistence Round-Trip**
    - **Validates: Requirements 6.2, 6.4**

  - [ ] 4.5 Handle storage errors and edge cases
    - Display error message if Local Storage is disabled
    - Display error message if data is corrupted on load
    - Initialize empty state on corruption
    - _Requirements: 6.6, 6.7_

- [ ] 5. Implement input form functionality
  - [ ] 5.1 Wire form submission to validation and transaction creation
    - Connect form submit event to validation
    - On success, create transaction via TransactionManager
    - On failure, display error message
    - _Requirements: 1.8, 1.9_

  - [ ] 5.2 Clear form fields after successful transaction submission
    - Clear item name, amount, and reset category dropdown
    - _Requirements: 1.11_

  - [ ] 5.3 Wire form to StorageManager.save on successful submission
    - Save transaction to Local Storage after creation
    - Handle storage errors
    - _Requirements: 6.2, 6.7_

- [ ] 6. Implement transaction list display
  - [ ] 6.1 Create TransactionList component with render method
    - Display all transactions from memory array in creation order
    - Show item name, amount (2 decimal places), category for each transaction
    - Include delete button for each transaction
    - _Requirements: 2.3, 2.7, 3.1_

  - [ ] 6.2 Write property test for transaction display formatting
    - **Property 9: Transaction Display Formatting**
    - **Validates: Requirements 2.3**

  - [ ] 6.3 Display empty state message when no transactions exist
    - Show "No transactions yet. Start by adding one!" when transaction array is empty
    - _Requirements: 2.1_

  - [ ] 6.4 Make transaction list scrollable when content exceeds container height
    - Apply overflow:auto CSS to transaction list container
    - _Requirements: 2.2_

  - [ ] 6.5 Implement delete button click handler with confirmation
    - Show confirmation dialog when delete button clicked
    - Only delete if user confirms
    - Display deletion feedback
    - _Requirements: 3.1, 3.2, 3.6_

  - [ ] 6.6 Wire delete action to TransactionManager and StorageManager
    - Remove from memory array via TransactionManager.delete()
    - Remove from Local Storage via StorageManager.delete()
    - Handle storage errors
    - _Requirements: 3.3, 3.7_

- [ ] 7. Implement balance display component
  - [ ] 7.1 Create BalanceDisplay component with update method
    - Calculate sum of all transaction amounts
    - Format with exactly 2 decimal places
    - _Requirements: 4.2_

  - [ ] 7.2 Write property test for balance calculation
    - **Property 5: Balance Calculation Correctness**
    - **Validates: Requirements 4.2, 4.7**

  - [ ] 7.3 Implement thousands separator formatting for values ≥ 1000
    - Format balance with comma separators
    - Use Intl.NumberFormat or similar
    - _Requirements: 4.3_

  - [ ] 7.4 Write property test for balance display formatting
    - **Property 6: Balance Display Formatting**
    - **Validates: Requirements 4.3**

  - [ ] 7.5 Display 0.00 when no transactions exist
    - Default to zero state
    - _Requirements: 4.7_

  - [ ] 7.6 Wire balance display to transaction changes
    - Update balance when transaction added or deleted
    - _Requirements: 4.5, 4.6_

- [ ] 8. Implement chart component
  - [ ] 8.1 Load Chart.js library from CDN
    - Add script tag to index.html with Chart.js CDN link
    - Handle library load failures
    - _Requirements: 12.1, 12.2, 12.5_

  - [ ] 8.2 Create ChartComponent module with update method
    - Aggregate transaction spending by category (Food, Transport, Fun)
    - Create data format for Chart.js with labels and data values
    - _Requirements: 5.2, 5.4_

  - [ ] 8.3 Write property test for category aggregation
    - **Property 7: Category Aggregation Correctness**
    - **Validates: Requirements 5.2, 5.4**

  - [ ] 8.4 Exclude categories with zero spending from chart
    - Filter out categories that have no transactions
    - Only include categories with at least one transaction
    - _Requirements: 5.3, 5.5_

  - [ ] 8.5 Write property test for zero-spending exclusion
    - **Property 8: Category Zero-Spending Exclusion**
    - **Validates: Requirements 5.3, 5.5**

  - [ ] 8.6 Render pie chart using Chart.js
    - Initialize Chart.js instance with canvas element
    - Pass aggregated data to chart library
    - _Requirements: 5.1, 12.3, 12.4_

  - [ ] 8.7 Display empty state message when no transactions exist
    - Show "No spending data available" message when no chart data
    - Hide canvas, show message div
    - _Requirements: 5.8_

  - [ ] 8.8 Handle chart library load failures
    - Display error message if Chart.js fails to load
    - Application remains functional without chart
    - _Requirements: 12.5_

- [ ] 9. Implement real-time updates and event system
  - [ ] 9.1 Create event dispatcher for transaction changes
    - Emit "transaction:created" event when transaction added
    - Emit "transaction:deleted" event when transaction deleted
    - _Requirements: 2.5, 2.6, 3.4, 3.5_

  - [ ] 9.2 Wire event dispatcher to update all components
    - Listen for transaction:created and transaction:deleted events
    - Trigger TransactionList.render(), BalanceDisplay.update(), ChartComponent.update()
    - _Requirements: 2.5, 2.6, 3.4, 3.5_

  - [ ] 9.3 Ensure all updates complete within 100ms
    - Optimize DOM updates to avoid excessive reflows
    - Batch updates where possible
    - _Requirements: 2.5, 2.6, 3.4, 3.5, 10.3, 10.4_

- [ ] 10. Implement responsive design and styling
  - [ ] 10.1 Create complete CSS styles in css/styles.css
    - Mobile-first layout starting at 320px minimum
    - Form styling with proper spacing and input appearance
    - Transaction list styling with scrollable container
    - Balance display prominent positioning at top
    - Chart container styling
    - _Requirements: 11.1, 11.2, 11.3, 11.5, 11.6, 11.7_

  - [ ] 10.2 Implement desktop layout for viewport ≥ 768px
    - Multi-column layout for desktop
    - Improved spacing and component positioning
    - _Requirements: 11.5_

  - [ ] 10.3 Ensure touch targets are minimum 44x44 pixels
    - Apply padding to buttons and form controls
    - _Requirements: 11.4_

  - [ ] 10.4 Implement error message styling
    - Display validation errors with clear visual distinction
    - Color, icon, or positioning to indicate error state
    - _Requirements: 1.8, 8.3_

  - [ ] 10.5 Implement loading indicator styling
    - Display loading spinner or message during Local Storage retrieval > 500ms
    - _Requirements: 10.6_

- [ ] 11. Implement application initialization
  - [ ] 11.1 Create app initialization sequence
    - Load all HTML elements
    - Initialize StorageManager to load persisted transactions
    - Check if Local Storage retrieval exceeds 500ms
    - If loading takes > 500ms, display loading indicator
    - _Requirements: 10.5, 10.6, 6.8, 6.9, 6.10_

  - [ ] 11.2 Render initial UI with persisted data
    - Populate TransactionList with stored transactions
    - Update BalanceDisplay with calculated balance
    - Update ChartComponent with aggregated data
    - _Requirements: 6.8, 6.9, 6.10_

  - [ ] 11.3 Wire form input responsiveness handlers
    - Add input event listeners to Item Name and Amount fields
    - Add change event listener to Category dropdown
    - Ensure response time < 50ms
    - _Requirements: 10.1, 10.2_

  - [ ] 11.4 Display Local Storage availability error if needed
    - Check if Local Storage is disabled on app load
    - Display error message and continue with empty state
    - _Requirements: 6.7_

- [ ] 12. Checkpoint - Verify core functionality
  - Ensure form validation accepts and rejects inputs correctly
  - Ensure transactions are created, stored, and displayed correctly
  - Ensure balance calculation is accurate
  - Ensure chart renders with correct category aggregation
  - Ensure Local Storage persistence works across page reload
  - Verify all updates complete within 100ms
  - Ensure all form inputs respond within 50ms
  - Ensure app loads and displays in interactive state within 500ms
  - Ask the user if questions arise

- [ ] 13. Write comprehensive unit tests
  - [ ] 13.1* Write unit tests for ValidationEngine
    - Test item name validation with various inputs
    - Test amount validation with edge cases
    - Test category validation
    - _Requirements: 1.3, 1.4, 1.5, 1.6, 1.7_

  - [ ] 13.2* Write unit tests for TransactionManager
    - Test transaction creation
    - Test unique ID generation
    - Test transaction deletion
    - Test transaction order preservation
    - _Requirements: 1.9, 6.1, 3.3, 2.7_

  - [ ] 13.3* Write unit tests for BalanceDisplay
    - Test balance calculation accuracy
    - Test formatting with 2 decimal places
    - Test thousands separator application
    - Test zero balance display
    - _Requirements: 4.2, 4.3, 4.7_

  - [ ] 13.4* Write unit tests for ChartComponent
    - Test category aggregation
    - Test zero-spending category exclusion
    - Test empty state handling
    - Test chart data format
    - _Requirements: 5.2, 5.3, 5.4, 5.5_

  - [ ] 13.5* Write unit tests for StorageManager
    - Test loading from empty Local Storage
    - Test saving and retrieving transactions
    - Test deletion from storage
    - Test error handling (quota exceeded, disabled storage)
    - _Requirements: 6.2, 6.3, 6.4, 6.5, 6.7_

- [ ] 14. Write integration tests
  - [ ] 14.1* Write integration test for add transaction workflow
    - Fill form, submit, verify transaction list, balance, and chart updated
    - Verify updates complete within 100ms
    - Verify transaction persisted to Local Storage
    - _Requirements: 1.9, 2.5, 3.4, 4.5, 6.2, 10.3_

  - [ ] 14.2* Write integration test for delete transaction workflow
    - Add transaction, delete it, verify updates to list, balance, chart
    - Verify deletion persisted to Local Storage
    - Verify updates complete within 100ms
    - _Requirements: 3.3, 3.4, 3.5, 2.6, 3.5, 10.4_

  - [ ] 14.3* Write integration test for app initialization with persisted data
    - Store transactions to Local Storage
    - Reload page
    - Verify transactions loaded and displayed correctly
    - Verify balance and chart updated
    - _Requirements: 6.4, 6.8, 6.9, 6.10_

  - [ ] 14.4* Write integration test for error handling
    - Test Local Storage disabled error
    - Test corrupted data recovery
    - Test quota exceeded error
    - Test Chart.js load failure
    - _Requirements: 6.6, 6.7, 12.5_

- [ ] 15. Final checkpoint - Ensure all tests pass
  - Run all unit tests and ensure 100% pass rate
  - Run all integration tests and ensure 100% pass rate
  - Run all property-based tests and ensure 100% pass rate
  - Verify application loads within 500ms
  - Verify all updates complete within 100ms
  - Verify form inputs respond within 50ms
  - Test responsiveness at 320px, 768px, and 1200px viewports
  - Test in Chrome, Firefox, Safari, and Edge browsers
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP (core functionality works without tests)
- Each task references specific requirements for full traceability
- Property test sub-tasks (marked with *) validate universal correctness properties
- Unit test sub-tasks (marked with *) test specific examples and edge cases
- Integration test sub-tasks (marked with *) test end-to-end workflows
- Checkpoints provide validation points to catch issues early
- Application uses vanilla JavaScript with no frameworks, following Requirements 7.3, 7.5
- Chart.js is the only external library, used for chart rendering (Requirement 12)
- All other functionality is implemented with vanilla JavaScript and built-in browser APIs

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["2.1", "2.3", "2.5"] },
    { "id": 2, "tasks": ["2.2", "2.4", "2.6", "2.7", "3.1", "3.3", "3.5", "3.6"] },
    { "id": 3, "tasks": ["3.2", "3.4", "3.7", "4.1", "4.2", "4.3"] },
    { "id": 4, "tasks": ["4.4", "4.5", "5.1", "5.2", "5.3"] },
    { "id": 5, "tasks": ["6.1", "6.3", "6.4", "6.5", "6.6", "7.1", "8.1", "8.2"] },
    { "id": 6, "tasks": ["6.2", "7.2", "7.3", "8.3", "8.4"] },
    { "id": 7, "tasks": ["7.4", "7.5", "7.6", "8.5", "8.6", "8.7", "8.8", "9.1"] },
    { "id": 8, "tasks": ["9.2", "9.3", "10.1", "10.2", "10.3", "10.4", "10.5"] },
    { "id": 9, "tasks": ["11.1", "11.2", "11.3", "11.4"] },
    { "id": 10, "tasks": ["13.1", "13.2", "13.3", "13.4", "13.5"] },
    { "id": 11, "tasks": ["14.1", "14.2", "14.3", "14.4"] }
  ]
}
```
