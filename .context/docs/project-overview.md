# Project Overview

## Introduction

Legal Guardian is a comprehensive legal technology platform designed to assist in document analysis and negotiation. It leverages AI capabilities to analyze legal documents, identify clauses, assess risk levels, and suggest negotiation parameters. The system is built as a monorepo containing a frontend application, a backend service, and a shared core package.

## Goal & Mission

To streamline the legal document review process by providing automated insights, risk assessment, and intelligent negotiation support, thereby reducing the time and complexity involved in legal contract management.

## Key Features

- **Document Analysis**: Automated breakdown of legal documents into clauses with associated risk levels.
- **Risk Assessment**: Categorization of clauses into risk levels (e.g., Low, Medium, High).
- **Negotiation Support**: Suggestions for negotiating terms based on analyzed content.
- **AI Integration**: Utilizes AI services for semantic analysis and content understanding.

## System Structure

The project is structured as a monorepo consisting of:

- **Frontend (`apps/frontend`)**: A React-based web application for user interaction, document upload, and result visualization.
- **Backend (`apps/backend`)**: A Node.js/TypeScript backend handling business logic, API endpoints, and AI integrations.
- **Core (`packages/core`)**: A shared library containing common types, interfaces, and utilities used across both frontend and backend.

## Technology Stack

- **Language**: TypeScript (used across the entire stack).
- **Frontend**: React, Vite.
- **Backend**: Node.js, Express (implied by HTTP controllers), with Clean Architecture principles.
- **Package Management**: npm/pnpm workspaces.
- **AI**: Integration with AI services (Abstracted via `AIService`).

## Core Framework Stack

- **Backend**: Implements Clean Architecture with distinct layers for Infrastructure, Use Cases, and Interfaces.
- **Frontend**: Component-based architecture.
- **Data**: Data flow is managed via typed interfaces shared from the `core` package.

## Getting Started Checklist

1. **Installation**: Run `npm install` (or `pnpm install`) in the root directory to install dependencies for all workspaces.
2. **Environment Setup**: Configure `.env` files for backend and frontend as needed (API keys, ports).
3. **Run Backend**: Navigate to `apps/backend` and start the server (e.g., `npm run dev`).
4. **Run Frontend**: Navigate to `apps/frontend` and start the development server (e.g., `npm run dev`).
5. **Verify**: Open the frontend URL and ensure it connects to the backend health check or API.

## Next Steps

- Review `architecture.md` for a deeper dive into the Clean Architecture implementation.
- Check `development-workflow.md` for contribution guidelines.
- Explore `tooling.md` for available scripts and utilities.
