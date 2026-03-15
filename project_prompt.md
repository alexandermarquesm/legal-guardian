# Master Prompt: Project "Legal Guardian"

**Objective:** Build a web platform called "Legal Guardian" that analyzes legal documents (contracts, terms of service) using AI to identify risks, explain clauses in simple terms, and automatically generate negotiation emails.

## 1. Product Vision

"Translate Legalese into Human, then Negotiate like a Lawyer."
The goal is not just to translate, but to empower the user to take action against abusive clauses.

### Core Features:

1.  **Document Upload:** PDF/DOCX upload.
2.  **Analysis Dashboard:**
    - **Risk Score:** 0-100 score of how "dangerous" the document is.
    - **Clause Breakdown:** List of clauses with "Red Flags" (High Risk) and "Yellow Flags" (Caution).
    - **Translation:** Click a clause to see a "Explain to me like I'm 5" version.
3.  **The "Negotiator" (Killer Feature):**
    - Users can select problematic clauses.
    - The system generates a formal, legally-sound email to the counterparty requesting changes to those specific clauses, citing relevant laws (e.g., consumer protection laws).
4.  **History:** Save and manage past analyses.

## 2. Technical Stack & Constraints (Strict)

### Architecture: Monorepo

Use a Monorepo structure (e.g., Turborepo or simple workspace).

- `apps/web`: Frontend Application.
- `apps/api`: Main Backend Application.
- `apps/ai-service`: Python AI Microservice/Scripts.
- `packages/`: Shared types/configs.

### Frontend (`apps/web`)

- **Framework:** React
- **Language:** TypeScript
- **Styling:** TailwindCSS (Modern, clean, "LegalTech" aesthetic - Navy Blue/Gold/White).
- **State Management:** Context API or Zustand.

### Backend (`apps/api`)

- **Framework:** Node.js (Express or NestJS).
- **Language:** TypeScript.
- **Architecture:** **Clean Architecture** (Critical).
  - Organize by layers: `Domain` (Entities), `UseCase` (Application Logic), `Interface Adapters` (Controllers), `Infrastructure` (DB/External APIs).
  - Dependency Injection is required.
- **Database:** MongoDB.

### AI Service (`apps/ai-service`)

- **Language:** **Python**.
- **Role:** Handles the heavy lifting of interacting with LLMs (e.g., OpenAI/Anthropic via API).
- **Communication:** The Node `api` calls this Python service (via HTTP/gRPC or message queue) to perform the analysis.
- **Libraries:** LangChain (optional), Pydantic.

## 3. Implementation Steps

1.  **Setup:** Initialize the Monorepo.
2.  **Backend Core:** Setup Clean Architecture layers in Node.js. Implement User Auth (JWT).
3.  **AI Service:** Create a Python endpoint that accepts text, prompts the LLM for analysis (JSON output), and returns the specific breakdown of clauses + negotiation text.
4.  **Frontend:** Build the Landing Page, Upload Interface, and the interactive Analysis Dashboard.
5.  **Integration:** Connect Frontend -> Node API -> Python AI.

## 4. UI/UX Guidelines

- **Trustworthy:** Design must look professional and secure.
- **Clarity:** Use typography to separate "Original Text" (Serif) from "Simple Explanation" (Sans-Serif).
- **Action-Oriented:** The "Generate Negotiation Email" button should be prominent.

Please start by designing the project structure and the Domain Entities.
