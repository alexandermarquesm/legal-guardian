import { IFileParserStrategy } from "../domain/interfaces/IFileParserStrategy";
import { PdfParserStrategy } from "./strategies/PdfParserStrategy";
import { DocxParserStrategy } from "./strategies/DocxParserStrategy";

export class FileParserService {
  private strategies: IFileParserStrategy[];

  constructor() {
    this.strategies = [
      new PdfParserStrategy(),
      new DocxParserStrategy(),
      // Add more strategies here (e.g. ImageParserStrategy)
    ];
  }

  async parseFile(buffer: Buffer, mimeType: string): Promise<string> {
    console.log(`Parsing file with mimeType: ${mimeType}`);

    // Robustness: Check for PDF Magic Bytes (%PDF) overrides mime type
    if (buffer.toString("ascii", 0, 4) === "%PDF") {
      console.log("Detected PDF magic bytes. Switching strategy to PDF.");
      const pdfStrategy = this.strategies.find((s) =>
        s.supports("application/pdf"),
      );
      if (pdfStrategy) return pdfStrategy.parse(buffer);
    }

    if (mimeType.startsWith("text/plain")) {
      return buffer.toString("utf-8");
    }

    const strategy = this.strategies.find((s) => s.supports(mimeType));

    if (strategy) {
      return strategy.parse(buffer);
    }

    throw new Error(`Unsupported file type: ${mimeType}`);
  }
}
