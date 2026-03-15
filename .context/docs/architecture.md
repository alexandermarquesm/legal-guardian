# Architecture

## High-Level Diagram

The system follows a monorepo structure with a clear separation of concerns between the frontend, backend, and shared core logic.

```mermaid
graph TD
    Frontend[Frontend App (apps/frontend)] --> API[Backend API (apps/backend)]
    Frontend --> Shared[Shared Core (packages/core)]
    API --> Shared
    API --> AI[AI Service Integration]
```

## Layers & Patterns

### 1. Frontend Layer

- **Location**: `apps/frontend`
- **Pattern**: Component-based Architecture (React)
- **Responsibility**: User interface, state management, API consumption.
- **Key References**: Relies on `packages/core` for shared types.

### 2. Backend Layer

- **Location**: `apps/backend`
- **Pattern**: Clean Architecture / Hexagonal Architecture
- **Structure**:
  - **Interfaces (`apps/backend/src/interfaces`)**: Controllers handling HTTP requests.
  - **Use Cases (`apps/backend/src/usecases`)**: Application business rules (e.g., `AnalyzeDocument`, `NegotiateParams`).
  - **Infrastructure (`apps/backend/src/infrastructure`)**: External interfaces (e.g., `AIService`).
- **Responsibility**: Business logic, data processing, AI integration.

### 3. Core Layer (Shared Kernel)

- **Location**: `packages/core`
- **Pattern**: Shared Library
- **Responsibility**: Common domain models, types, and DTOs shared between frontend and backend.
- **Key Constructs**: `Clause`, `RiskLevel`, `DocumentAnalysis`, `NegotiationRequest`.

## Top Directories Snapshot

- `apps/backend/src/infrastructure`: AI Services and adapters.
- `apps/backend/src/usecases`: Core business logic units.
- `apps/backend/src/interfaces`: HTTP Controllers and routing logic.
- `apps/frontend/src/components`: UI components.
- `packages/core/src`: Shared type definitions.

## Key Decisions & Trade-offs

- **Monorepo**: Chosen to facilitate code sharing (especially types) between frontend and backend, ensuring type safety across the network boundary.
- **Clean Architecture**: Implemented on the backend to decouple business logic from framework details (Express) and external services (AI), making the system more testable and maintainable.
- **Shared Core**: Defines the "language" of the domain (Contracts, Risk, Negotiations) in a single place to prevents drift between client and server.

## Related Resources

- [Project Overview](project-overview.md)
- `codebase-map.json`
