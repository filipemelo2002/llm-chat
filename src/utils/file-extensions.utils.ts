import pdf from "pdf-parse";
import mammoth from "mammoth";

export async function getTextFromPdf(buffer: Buffer): Promise<string> {
  const result = await pdf(buffer);
  return result.text;
}

export async function getTextFromDocx(buffer: Buffer) {
  const { value } = await mammoth.extractRawText({ buffer });
  return value;
}
