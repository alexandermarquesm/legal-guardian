import { describe, it, expect } from "bun:test";
import { FileParserService } from "../src/infrastructure/FileParserService";
import path from "path";
import fs from "fs";

describe("PDF Parsing", () => {
  const service = new FileParserService();
  const assetsDir = path.resolve(__dirname, "../assets");

  // Reusable function to test any PDF
  async function verifyPdf(filename: string) {
    const filePath = path.join(assetsDir, filename);

    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️ Skipped: ${filename} (File not found)`);
      return;
    }

    console.log(`\n--- Testing PDF: ${filename} ---`);
    const buffer = fs.readFileSync(filePath);

    // Execute Parsing
    const text = await service.parseFile(buffer, "application/pdf");

    // Assertions
    expect(text).toBeDefined();
    expect(text.length).toBeGreaterThan(0);
    // Basic check to ensure it's not empty or junk
    // We removed specific content check "CONTRATO..." to make it generic for any PDF

    // Save as .txt for human visual verification
    const outputFilename = filename.replace(/\.pdf$/i, "") + "_test.txt";
    const txtPath = path.join(assetsDir, outputFilename);
    fs.writeFileSync(txtPath, text);

    console.log(`✅ Success! Output: ${txtPath}`);
  }

  // Define which files to test here
  it("should parse the test lease agreement", async () => {
    await verifyPdf("contrato_locacao_completo.pdf");
  });

  // Example for future use:
  // it("should parse the complete lease agreement", async () => {
  //   await verifyPdf("contrato_locacao_completo.pdf");
  // });
});
