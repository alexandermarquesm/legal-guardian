import { IFileParserStrategy } from "../../domain/interfaces/IFileParserStrategy";
import mammoth from "mammoth";

export class DocxParserStrategy implements IFileParserStrategy {
  supports(mimeType: string): boolean {
    return (
      mimeType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      mimeType === "application/msword"
    );
  }

  async parse(buffer: Buffer): Promise<string> {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } catch (error) {
      console.error("Error parsing DOCX strategy:", error);
      throw new Error("Failed to parse DOCX file");
    }
  }
}
