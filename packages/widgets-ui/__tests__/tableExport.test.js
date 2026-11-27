import { buildXLSXBytes, normalizeColumn } from "../src/table/tableUtils";

const decode = (bytes) => new TextDecoder().decode(bytes);

const columns = [
  normalizeColumn({ key: "name", label: "Name" }),
  normalizeColumn({ key: "amount", label: "Amount", type: "number" }),
  normalizeColumn({ key: "paid", label: "Paid", type: "boolean" }),
];

const rows = [
  { name: "Ada & Co", amount: 1250, paid: true },
  { name: "Grace", amount: "n/a", paid: false },
];

describe("buildXLSXBytes", () => {
  test("produces a ZIP container with the required OOXML parts", () => {
    const bytes = buildXLSXBytes(columns, rows);
    expect(bytes).toBeInstanceOf(Uint8Array);
    expect(bytes[0]).toBe(0x50);
    expect(bytes[1]).toBe(0x4b);
    expect(bytes[2]).toBe(0x03);
    expect(bytes[3]).toBe(0x04);

    const text = decode(bytes);
    expect(text).toContain("[Content_Types].xml");
    expect(text).toContain("xl/workbook.xml");
    expect(text).toContain("xl/worksheets/sheet1.xml");
    expect(text).toContain("<sheet name=\"Data\"");
    expect(text).toContain("Ada &amp; Co");
    expect(text).toContain("<v>1250</v>");
    expect(text).toContain("t=\"b\"");
    expect(text).toContain("<t>Name</t>");
  });

  test("ends with an end-of-central-directory record", () => {
    const bytes = buildXLSXBytes(columns, rows);
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const endOffset = bytes.byteLength - 22;
    expect(view.getUint32(endOffset, true)).toBe(0x06054b50);
    expect(view.getUint16(endOffset + 8, true)).toBe(6);
  });

  test("handles an empty row set without throwing", () => {
    const bytes = buildXLSXBytes(columns, []);
    expect(bytes.length).toBeGreaterThan(0);
    expect(decode(bytes)).toContain("<row r=\"1\">");
  });
});
