import { Clause, NegotiationEmail } from "../domain";
import { AIService } from "../infrastructure/AIService";

export class NegotiateParamsUseCase {
  constructor(private aiService: AIService) {}

  async execute(clauses: Clause[]): Promise<NegotiationEmail> {
    console.log(
      "Generating negotiation email for clauses:",
      clauses.map((c) => c.id),
    );
    const emailBody = await this.aiService.generateNegotiationEmail(clauses);

    return {
      id: crypto.randomUUID(),
      subject: "Discussion regarding contract terms",
      body: emailBody,
      targetClauses: clauses.map((c) => c.id),
      generatedAt: new Date(),
    };
  }
}
