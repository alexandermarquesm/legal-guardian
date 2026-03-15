import { IFileParserStrategy } from "../../domain/interfaces/IFileParserStrategy";
const { PDFParse } = require("pdf-parse");

export class PdfParserStrategy implements IFileParserStrategy {
  supports(mimeType: string): boolean {
    return mimeType === "application/pdf";
  }

  async parse(buffer: Buffer): Promise<string> {
    try {
      // Using the class-based approach required for pdf-parse v2.4.5
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();

      // Clean up artifacts and normalize text
      let cleanText = result.text
        .replace(/\n\s*--\s*\d+\s*of\s*\d+\s*--\s*\n/g, "\n") // Remove page counters
        .split("\n")
        .map((line: string) => line.trim()) // Trim trailing/leading whitespace per line
        .join("\n")
        .replace(/\n\s*\n\s*\n/g, "\n\n") // Normalize multiple blank lines to max 2
        .trim();

      return cleanText;
    } catch (error) {
      console.error("Error parsing PDF strategy:", error);
      throw new Error("Failed to parse PDF file");
    }
  }
}
