import pdf from "pdf-parse"

export async function getTextFromPdf(buffer: Buffer): Promise<string> {
  const result = await pdf(buffer)
  return result.text
}
