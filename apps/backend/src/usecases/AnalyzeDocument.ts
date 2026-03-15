import { DocumentAnalysis } from "../domain";
import { AIService } from "../infrastructure/AIService";
import { FileParserService } from "../infrastructure/FileParserService";

export class AnalyzeDocumentUseCase {
  constructor(
    private aiService: AIService,
    private fileParser: FileParserService,
  ) {}

  async execute(
    fileBuffer: Buffer,
    mimeType: string,
  ): Promise<DocumentAnalysis> {
    console.log(`Analyzing document (${mimeType})...`);

    // 1. Parse File to Text
    const text = await this.fileParser.parseFile(fileBuffer, mimeType);

    // 2. Analyze with AI
    return this.aiService.analyzeText(text);
  }
}
