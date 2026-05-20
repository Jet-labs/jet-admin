# Consolidated Page Header Design

Standardize the header area of the update pages across all modules to provide a consistent user experience.

## Objective
- Standardize the layout, button order, height, and alignment.
- Standardize the text for common actions.
- Add missing functionality (Clone, Delete) where absent.

## Scope
The following modules' update pages will be updated:
1. Data Sources
2. Data Queries
3. Listeners
4. Workflows
5. Widgets
6. Dashboards
7. API Keys
8. Scheduled Jobs (Cron Jobs)

## Design
- **Layout:** Classic Right-Aligned. Title and ID on the left, all actions grouped on the right.
- **Button Order:** History -> Clone -> Delete -> Update (Primary).
- **Button Text:**
  - Primary Action: `Update`
  - Destructive Action: `Delete`
  - Duplication Action: `Clone`
  - Secondary Action: `View History` (where applicable)

## Missing Functionality to Implement
- **Clone:** Add to Listeners, Workflows, API Keys, and Cron Jobs.
- **Delete:** Add to Workflows.

## Component Interface
We will create a reusable `PageHeader` component with the following props:
- `title`: string
- `id`: string
- `actions`: array of strings (`['save', 'delete', 'clone', 'history']`)
- `onSave`: function
- `onDelete`: function
- `onClone`: function
- `onHistory`: function
- `isSaving`: boolean
- `isDeleting`: boolean
- `isCloning`: boolean
