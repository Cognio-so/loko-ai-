import ExcelJS from "exceljs";
import { type SpreadsheetSheet, type StructuredFileContent } from "@/lib/file-generators/types";

function fallbackSheet(content: StructuredFileContent): SpreadsheetSheet {
  const table = content.tables[0];
  return {
    name: "Overview",
    headers: table?.headers.length ? table.headers : ["Item", "Detail"],
    rows: table?.rows.length ? table.rows : [["Summary", content.summary]],
  };
}

export async function generateXlsx(content: StructuredFileContent) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "LokoAI";
  workbook.created = new Date();

  const sheets = content.sheets.length ? content.sheets : [fallbackSheet(content)];

  for (const sheetData of sheets) {
    const worksheet = workbook.addWorksheet(sheetData.name || "Sheet");
    worksheet.addRow(sheetData.headers);
    sheetData.rows.forEach((row) => worksheet.addRow(row));

    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0EA5E9" },
    };

    worksheet.columns.forEach((column) => {
      let maxLength = 12;
      column.eachCell?.((cell) => {
        maxLength = Math.max(maxLength, String(cell.value ?? "").length + 2);
      });
      column.width = Math.min(maxLength, 42);
    });
    worksheet.views = [{ state: "frozen", ySplit: 1 }];
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
