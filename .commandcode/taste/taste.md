# Backend Guidelines
- In route middleware chains, place Zod validation before auth/authorization middleware. Confidence: 0.70
- Import environment variables as `const environmentVariables = require("../environment")` at top of file, then access as `environmentVariables.X` — never inline `require("../environment").X`. Confidence: 0.70
- Always pass an explicit HTTP status code (5th argument) to `expressUtils.sendResponse()`. Confidence: 0.70

# Backend Codebase
- Remove references to `CODE_AUDIT_REPORT.md` from documentation files. Confidence: 0.70
