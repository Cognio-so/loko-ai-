import {
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import { type FileTable, type StructuredFileContent } from "@/lib/file-generators/types";

function createDocxTable(table: FileTable) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: table.headers.map(
          (header) =>
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: header, bold: true })] })],
            })
        ),
      }),
      ...table.rows.map(
        (row) =>
          new TableRow({
            children: row.map((cell) => new TableCell({ children: [new Paragraph(String(cell))] })),
          })
      ),
    ],
  });
}

export async function generateDocx(content: StructuredFileContent) {
  const children: Array<Paragraph | Table> = [
    new Paragraph({ text: content.title, heading: HeadingLevel.TITLE }),
    new Paragraph({ text: content.subtitle, heading: HeadingLevel.HEADING_2 }),
    new Paragraph(content.summary),
  ];

  for (const section of content.sections) {
    children.push(new Paragraph({ text: section.heading, heading: HeadingLevel.HEADING_1 }));
    section.paragraphs.forEach((paragraph) => children.push(new Paragraph(paragraph)));
    section.bullets.forEach((bullet) => children.push(new Paragraph({ text: bullet, bullet: { level: 0 } })));
    if (section.table) {
      children.push(new Paragraph({ text: section.table.title, heading: HeadingLevel.HEADING_2 }));
      children.push(createDocxTable(section.table));
    }
  }

  const document = new Document({
    sections: [{ children }],
  });

  return Buffer.from(await Packer.toBuffer(document));
}
