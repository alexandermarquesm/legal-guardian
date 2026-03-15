export interface IFileParserStrategy {
  supports(mimeType: string): boolean;
  parse(buffer: Buffer): Promise<string>;
}
