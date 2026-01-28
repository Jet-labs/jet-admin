---
name: documenter
description: Generates comprehensive technical documentation including function-to-function maps, data flow, state management patterns, and architectural diagrams. Use this when the user asks for "system documentation," "architecture review," or "codebase explanation."
---

# Documentation Generator Skill

## Goal
Analyze the current workspace and generate a single, comprehensive `TECHNICAL_BLUEPRINT.md` file that maps the entire system architecture, data flow, and function-level relationships.

## Process Strategy
Do not just summarize files one by one. You must trace execution paths. Follow these phases:

### Phase 1: Reconnaissance
1. **Identify the Stack:** Read configuration files (`package.json`, `requirements.txt`, `docker-compose.yml`, `cargo.toml`) to understand the tech stack.
2. **Map Entry Points:** Find the `main`, `index`, or `app` entry points.
3. **Dependency Graph:** List internal vs. external dependencies.

### Phase 2: Deep Analysis (The "Antigravity" Lift)
For every major module, perform **Function-to-Function Tracing**:
1. **Call Hierarchy:** Who calls this function? What does this function call?
2. **Data Flow:** What arguments enter? What data types return?
3. **State Mutation:** Does this function modify global state (Redux, Context, Database, Singleton)?

### Phase 3: Documentation Generation
Create/Overwrite `TECHNICAL_BLUEPRINT.md` with the following specific sections:

#### 1. High-Level Architecture
- **Pattern Identification:** (e.g., MVC, Microservices, Event-Driven).
- **Service Map:** List all services and how they communicate (REST, gRPC, Pub/Sub).
- 

[Image of System Architecture]
 (Trigger a diagram generation if applicable).

#### 2. Data Flow & State Management
- **State Store:** (e.g., "Uses Redux Toolkit with slices X, Y, Z").
- **Data Lifecycle:** Trace a core entity (e.g., "User" or "Order") from API Request -> Controller -> Service -> Database -> Response.

#### 3. Module & Dependency Matrix
- Create a table listing modules, their responsibility, and their dependencies.

#### 4. Function-to-Function Detailed Map
*Select the top 5 critical files/controllers and provide a detailed flow:*
> **File:** `example_controller.ts`
> - `createOrder()`
>   - **Calls:** `InventoryService.checkStock()` -> `PaymentGateway.charge()`
>   - **State Change:** Updates `OrderState.status` to 'PENDING'
>   - **Error Handling:** Catches `InsufficientFundsError`

## Constraints
- **Be Concise but Deep:** Do not paste code blocks unless necessary for context. Use references.
- **Visuals:** Use Mermaid.js syntax for diagrams (Sequence diagrams for data flow).
- **Tone:** Senior Architect. Objective and analytical.