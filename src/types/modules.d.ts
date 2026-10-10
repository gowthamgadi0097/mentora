declare module "pdf-parse/lib/pdf-parse.js" {
  interface PdfData {
    numpages: number;
    text: string;
  }
  export default function pdf(data: Buffer): Promise<PdfData>;
}
