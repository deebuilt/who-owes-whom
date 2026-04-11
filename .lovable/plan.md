# Who Paid? — Shared Expense Tracker

A mobile-first, single-page app for tracking group expenses and calculating settlements in real time.

## Sections (top to bottom)

1. **Header** — App title "Who Paid?" with a Reset button
2. **People Setup** — Stepper to set number of people (2-10), with editable initials (default A, B, C...)
3. **Add Expense** — Amount input, payer selection (tap chips), optional label, "Add Expense" button
4. **Expense List** — Clean list showing label, amount, and who paid, with delete option per item
5. **Settlement Summary** — Total spent, equal share per person, and minimal settlement transactions (e.g. "A → B: $18.00")

## Design

- Clean, modern, mobile-first layout with card-based sections
- Tap-to-select chips for payer selection
- Accent color for primary actions
- All client-side, no backend, optional localStorage persistence
- Global styling with dark mode support

## Logic

- Settlement uses greedy algorithm to minimize number of transactions
- All amounts rounded to 2 decimal places with balanced totals
- &nbsp;