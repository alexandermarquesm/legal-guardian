import { describe, expect, test } from "bun:test";
import { AIService } from "../src/infrastructure/AIService";

describe("AIService", () => {
  test("analyzes text correctly", async () => {
    const service = new AIService();
    const result = await service.analyzeText("some contract text");

    expect(result.clauses.length).toBe(4); // Updated to match MOCK_DOCUMENT_ANALYSIS (4 clauses)
    expect(result.overallRiskScore).toBe(75); // Mock score is 75
    expect(result.status).toBe("COMPLETED");
  });

  test("generates negotiation email", async () => {
    const service = new AIService();
    const analysis = await service.analyzeText("test");
    const email = await service.generateNegotiationEmail(analysis.clauses);

    expect(email).toContain("Assunto: Discussão sobre termos do contrato");
    expect(email).toContain("Prezado(a)");
  });
});
