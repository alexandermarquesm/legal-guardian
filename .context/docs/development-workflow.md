# Development Workflow

## Overview

This document outlines the standard engineering processes for the Legal Guardian project. We follow a monorepo structure, meaning development often involves coordinating between the `apps/frontend`, `apps/backend`, and `packages/core` directories.

## Branching & Releases

- **Branching Model**: We use a feature-branch workflow.
  - `main`: The stable production-ready branch.
  - `feature/*`: Feature branches created from `main` (e.g., `feature/document-analysis`).
  - `fix/*`: Bug fix branches.
- **Releases**:
  - Merges to `main` should be potentially deployable.
  - Code sharing relies on the `packages/core` versioning (if published) or direct references (in a workspace setup).

## Local Development

### Prerequisites

- Node.js (Latest LTS recommended)
- npm or pnpm

### Commands

**1. Installation**
Install dependencies for all workspaces from the root:

```bash
npm install
# or
pnpm install
```

**2. Core Package**
If changes are made to `packages/core`, ensure they are built if necessary (though in most workspace setups, typescript sources are consumed directly).

```bash
cd packages/core
npm run build # if applicable
```

**3. Backend**
Run the backend in development mode:

```bash
cd apps/backend
npm run dev
```

**4. Frontend**
Run the frontend in development mode:

```bash
cd apps/frontend
npm run dev
```

**5. Testing**
Run tests across the project:

```bash
npm test
```

## Code Review Expectations

- **Clean Architecture**: Backend changes must adhere to the layering (Interfaces -> UseCases -> Infrastructure).
- **Type Safety**: Changes that affect the API contract (frontend-backend communication) must be reflected in `packages/core` types first.
- **Linting**: Ensure `npm run lint` passes before pushing.

## Cross-References

- [Testing Strategy](testing-strategy.md)
- [Tooling](tooling.md)
