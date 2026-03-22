# Release Notes v1.2.0

## What's New
This release brings significant architecture changes to workflows and widgets, as well as crucial bug fixes and improvements to the documentation deployment process. 

### Architecture & Feature Enhancements
- **Workflows**: Implemented event sourcing architecture.
- **Widgets**: Transitioned to modular widgets and integrated a functioning widget-workflow bridge.
- **Query Engine**: Removed direct query execution from widgets, routing it appropriately, alongside a major cleanup of the workflow and query engines.
- **UI & Experience**: Major UI refactor applied alongside the core architecture updates.

### Bug Fixes
- **Workflow Concurrency**: Fixed race conditions and concurrency issues during workflow execution.
- **Widget Output**: Fixed issues where workflow output references were not correctly mapped inside widgets.
- **Documentation Build**: Fixed the GitHub Actions deployment workflow for the Jet Admin Docusaurus site by adjusting Node.js versions and exact package dependency matching.

### Chore & Cleanup
- Extensive code cleanup focused on the workflows and widgets modules.
- Added Product Hunt badges to the project README.
- Docker deployment improvements.
- Documentation updates and restructured repository assets.
