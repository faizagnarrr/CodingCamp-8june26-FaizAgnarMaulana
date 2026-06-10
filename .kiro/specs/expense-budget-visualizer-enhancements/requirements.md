# Requirements Document

## Introduction

This document specifies requirements for three enhancement features to the Expense & Budget Visualizer application (Custom Categories, Transaction Sorting, and Dark/Light Mode):

1. **Custom Categories** - Allow users to create, save, and manage their own expense categories beyond the default options
2. **Transaction Sorting** - Enable users to sort transactions by amount or category with persistent preferences
3. **Dark/Light Mode** - Provide theme switching capability with automatic persistence

These enhancements improve user customization, data organization, and accessibility of the application.

## Glossary

- **Category**: A classification label assigned to each transaction (e.g., Food, Transport, Fun, or custom categories)
- **Custom Category**: A user-created category that persists in local storage alongside default categories
- **Default Categories**: Pre-defined categories provided by the application (Food, Transport, Fun)
- **Transaction**: A record containing item name, amount, category, and timestamp
- **Sort Option**: The selected sorting method (by amount ascending/descending or by category alphabetically)
- **Theme**: Visual appearance of the application (Light Mode or Dark Mode)
- **Theme Preference**: User's selected theme stored in local storage
- **UI Component**: Visual elements of the application (buttons, text, backgrounds, inputs)
- **Local Storage**: Browser storage mechanism for persisting data across sessions

## Requirements

### Requirement 1: Add Custom Category

**User Story:** As a user, I want to create custom categories for my transactions, so that I can organize expenses according to my personal spending patterns.

#### Acceptance Criteria

1. WHEN the user opens the category selection dropdown, THE Category_Manager SHALL display all default categories (Food, Transport, Fun) and all previously created custom categories.

2. WHEN the user wants to add a new custom category, THE Category_Manager SHALL provide an option to create a new category.

3. WHEN the user submits a new custom category name, THE Validator SHALL check that the category name is not empty, not longer than 50 characters, and not a duplicate of existing categories.

4. IF the category name validation fails, THEN THE Category_Manager SHALL display a specific error message indicating the validation failure reason.

5. WHEN a custom category is successfully created, THE Storage_Manager SHALL save it to local storage under the key "expense_categories".

6. WHEN the application reloads, THE Category_Manager SHALL load all saved custom categories from local storage and make them available for selection.

7. WHEN the user selects a custom category for a transaction, THE Transaction_Manager SHALL process the transaction normally using the custom category.

8. THE Chart_Component SHALL include custom categories in the spending distribution visualization with appropriate colors or patterns.

### Requirement 2: Delete Custom Category

**User Story:** As a user, I want to delete custom categories I no longer need, so that I can keep my category list organized.

#### Acceptance Criteria

1. WHEN the user views a custom category, THE Category_Manager SHALL display a delete option (icon or button) next to the category name.

2. WHEN the user clicks the delete option for a custom category, THE Category_Manager SHALL check if any existing transactions use that category.

3. IF the custom category is used by existing transactions, THEN THE Category_Manager SHALL display a message stating the category cannot be deleted and show how many transactions use it.

4. IF the custom category is not used by any transactions, THEN THE Category_Manager SHALL prompt the user for confirmation before deletion.

5. WHEN the user confirms deletion, THE Storage_Manager SHALL remove the category from local storage.

6. AFTER deletion, THE Category_Manager SHALL update the category dropdown to reflect the removal.

### Requirement 3: Sort Transactions by Amount

**User Story:** As a user, I want to sort my transactions by amount, so that I can quickly find high-value or low-value expenses.

#### Acceptance Criteria

1. WHEN the user views the transaction list, THE Sort_Manager SHALL provide a sort option specifically for sorting by amount.

2. WHEN the user selects "Sort by Amount (Ascending)", THE Sort_Manager SHALL reorder transactions from smallest to largest amount and update the display immediately.

3. WHEN the user selects "Sort by Amount (Descending)", THE Sort_Manager SHALL reorder transactions from largest to smallest amount and update the display immediately.

4. WHEN a sort option is applied, THE Sort_Manager SHALL save the selected sort option to local storage under the key "transaction_sort_preference".

5. WHEN the application reloads, THE Sort_Manager SHALL retrieve the saved sort preference from local storage and apply it to the transaction list.

### Requirement 4: Sort Transactions by Category

**User Story:** As a user, I want to sort my transactions by category, so that I can group related expenses together.

#### Acceptance Criteria

1. WHEN the user views the transaction list, THE Sort_Manager SHALL provide a sort option specifically for sorting by category.

2. WHEN the user selects "Sort by Category (Alphabetically)", THE Sort_Manager SHALL reorder transactions alphabetically by category name and update the display immediately.

3. WHEN a sort preference is applied, THE Sort_Manager SHALL save the selected sort option to local storage under the key "transaction_sort_preference".

4. WHEN multiple transactions share the same category, THE Sort_Manager SHALL maintain consistent ordering (by amount descending) within each category group.

5. WHEN the application reloads, THE Sort_Manager SHALL retrieve the saved sort preference and apply it to the transaction list.

### Requirement 5: Display Theme Toggle

**User Story:** As a user, I want to switch between dark and light themes, so that I can use the application comfortably in different lighting conditions.

#### Acceptance Criteria

1. WHEN the application loads, THE Theme_Manager SHALL display a theme toggle control (button or icon) in the header.

2. WHEN the user clicks the theme toggle, THE Theme_Manager SHALL switch from the current theme to the opposite theme (Light to Dark or Dark to Light).

3. WHEN the user switches themes, THE Theme_Manager SHALL apply the new theme CSS class to the entire document.

4. WHEN a theme change is applied, THE Theme_Manager SHALL save the selected theme to local storage under the key "theme_preference".

5. WHEN the application reloads, THE Theme_Manager SHALL retrieve the saved theme preference from local storage and apply it automatically.

6. IF no theme preference is saved, THEN THE Theme_Manager SHALL apply the Light Mode theme by default.

### Requirement 6: Dark Mode Styling

**User Story:** As a user, I want dark mode to have appropriate colors and contrast, so that the application is visually comfortable and accessible.

#### Acceptance Criteria

1. WHEN Dark Mode is active, THE Theme_Manager SHALL apply a dark background color to the body element (recommended: #1a1a1a or #121212).

2. WHEN Dark Mode is active, THE Theme_Manager SHALL apply light text colors to all text elements for contrast (recommended: #e0e0e0 or #f0f0f0).

3. WHEN Dark Mode is active, THE Theme_Manager SHALL apply dark backgrounds to all section elements with light borders.

4. WHEN Dark Mode is active, THE Theme_Manager SHALL update the balance display gradient to use dark mode appropriate colors.

5. WHEN Dark Mode is active, THE Theme_Manager SHALL update form input elements with dark backgrounds and light text.

6. WHEN Dark Mode is active, THE Theme_Manager SHALL update the chart component to use colors with sufficient contrast against the dark background.

7. WHEN Dark Mode is active, THE Theme_Manager SHALL maintain minimum contrast ratios of 4.5:1 for normal text and 3:1 for large text.

8. WHEN Dark Mode is active, THE Theme_Manager SHALL update category badge colors to remain visible and distinguishable.

### Requirement 7: Light Mode Styling

**User Story:** As a user, I want light mode to maintain the original visual design, so that the application remains consistent with its established design system.

#### Acceptance Criteria

1. WHEN Light Mode is active, THE Theme_Manager SHALL apply the original light background color to the body element (#f5f5f5).

2. WHEN Light Mode is active, THE Theme_Manager SHALL apply the original dark text colors (#333).

3. WHEN Light Mode is active, THE Theme_Manager SHALL apply the original section styling with white backgrounds and subtle shadows.

4. WHEN Light Mode is active, THE Theme_Manager SHALL apply the original gradient to the balance display section.

5. WHEN Light Mode is active, THE Theme_Manager SHALL apply the original colors to all form elements and buttons.

6. WHEN Light Mode is active, THE Theme_Manager SHALL apply the original chart colors and category badge colors.

### Requirement 8: Theme Consistency Across Components

**User Story:** As a user, I want the theme to apply consistently to all parts of the application, so that the experience is cohesive.

#### Acceptance Criteria

1. THE Theme_Manager SHALL apply the selected theme to the header element.

2. THE Theme_Manager SHALL apply the selected theme to the footer element.

3. THE Theme_Manager SHALL apply the selected theme to all section elements.

4. THE Theme_Manager SHALL apply the selected theme to all form inputs and select dropdowns.

5. THE Theme_Manager SHALL apply the selected theme to all buttons.

6. THE Theme_Manager SHALL apply the selected theme to all text elements and labels.

7. THE Theme_Manager SHALL apply the selected theme to error messages and status messages.

8. THE Theme_Manager SHALL apply the selected theme to the transaction list items and category badges.

### Requirement 9: Data Persistence for Categories

**User Story:** As a user, I want my custom categories to be saved automatically, so that I don't lose them when I close the application.

#### Acceptance Criteria

1. WHEN a custom category is created, THE Storage_Manager SHALL automatically save it to local storage without requiring user action.

2. WHEN a custom category is deleted, THE Storage_Manager SHALL automatically remove it from local storage.

3. WHEN the application loads, THE Category_Manager SHALL automatically retrieve all custom categories from local storage.

4. WHEN local storage is full or unavailable, THE Application SHALL display a message informing the user that category data cannot be saved.

### Requirement 10: Data Persistence for Sort Preferences

**User Story:** As a user, I want my sort preference to be remembered, so that the transaction list appears in my preferred order when I return.

#### Acceptance Criteria

1. WHEN the user selects a sort option, THE Storage_Manager SHALL save the sort preference to local storage immediately.

2. WHEN the application reloads, THE Sort_Manager SHALL apply the saved sort preference without requiring user action.

3. IF no sort preference is saved, THEN THE Sort_Manager SHALL display transactions in their original chronological order (newest first).

4. WHEN local storage is full or unavailable, THE Application SHALL display a message informing the user that sort preferences cannot be saved.

### Requirement 11: Data Persistence for Theme Preference

**User Story:** As a user, I want my theme preference to be remembered, so that the application applies my preferred theme automatically.

#### Acceptance Criteria

1. WHEN the user selects a theme, THE Storage_Manager SHALL save the theme preference to local storage immediately.

2. WHEN the application reloads, THE Theme_Manager SHALL apply the saved theme preference automatically.

3. IF no theme preference is saved, THEN THE Theme_Manager SHALL apply Light Mode by default.

4. WHEN local storage is full or unavailable, THE Application SHALL display a message informing the user that theme preferences cannot be saved.

### Requirement 12: No Breaking Changes to Existing Features

**User Story:** As a user, I want all existing transaction and budget features to continue working correctly, so that the enhancements don't break my workflow.

#### Acceptance Criteria

1. WHEN the user adds a transaction with a default category, THE Transaction_Manager SHALL process it identically to the current implementation.

2. WHEN the user adds a transaction with a custom category, THE Transaction_Manager SHALL process it the same way as default categories.

3. WHEN the user views the balance display, THE Balance_Calculator SHALL compute the total correctly including all transactions regardless of category type.

4. WHEN the user views the spending distribution chart, THE Chart_Component SHALL display all categories (default and custom) with correct totals.

5. WHEN the user deletes a transaction, THE Transaction_Manager SHALL remove it and update all displays correctly.

6. WHEN the application loads without any saved data, THE Application SHALL function correctly with only default categories.

