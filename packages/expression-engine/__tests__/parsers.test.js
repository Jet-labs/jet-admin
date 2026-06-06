/**
 * Tests for parsers.js — {{ }} grammar extraction
 */
import {
  TEMPLATE_BLOCK_REGEX,
  WHOLE_TEMPLATE_REGEX,
  extractTemplateBlocks,
  extractWholeTemplateExpression,
} from "../src/parsers.js";

describe("parsers", () => {
  // ─── extractTemplateBlocks ───────────────────────────────────────────────

  describe("extractTemplateBlocks", () => {
    it("extracts a single block", () => {
      const blocks = extractTemplateBlocks("Hello {{ctx.name}}!");
      expect(blocks).toHaveLength(1);
      expect(blocks[0].expression).toBe("ctx.name");
      expect(blocks[0].fullMatch).toBe("{{ctx.name}}");
      expect(blocks[0].index).toBe(6);
    });

    it("extracts multiple blocks", () => {
      const blocks = extractTemplateBlocks("{{a.b}} and {{c.d}}");
      expect(blocks).toHaveLength(2);
      expect(blocks[0].expression).toBe("a.b");
      expect(blocks[1].expression).toBe("c.d");
    });

    it("trims whitespace inside {{ }}", () => {
      const blocks = extractTemplateBlocks("{{  ctx.input.id  }}");
      expect(blocks[0].expression).toBe("ctx.input.id");
    });

    it("returns empty array for null/undefined/empty", () => {
      expect(extractTemplateBlocks(null)).toEqual([]);
      expect(extractTemplateBlocks(undefined)).toEqual([]);
      expect(extractTemplateBlocks("")).toEqual([]);
    });

    it("returns empty array for non-string primitives", () => {
      expect(extractTemplateBlocks(42)).toEqual([]);
      expect(extractTemplateBlocks(true)).toEqual([]);
    });

    it("flattens arrays", () => {
      const blocks = extractTemplateBlocks(["{{a}}", "{{b}}"]);
      expect(blocks).toHaveLength(2);
    });

    it("flattens plain objects (values only)", () => {
      const blocks = extractTemplateBlocks({ x: "{{a}}", y: "{{b}}" });
      expect(blocks).toHaveLength(2);
    });

    it("handles multiline expressions", () => {
      const blocks = extractTemplateBlocks("{{ctx.input\n.name}}");
      expect(blocks).toHaveLength(1);
      expect(blocks[0].expression).toBe("ctx.input\n.name");
    });
  });

  // ─── extractWholeTemplateExpression ──────────────────────────────────────

  describe("extractWholeTemplateExpression", () => {
    it("matches a whole-string expression", () => {
      const result = extractWholeTemplateExpression("{{ctx.input.id}}");
      expect(result).not.toBeNull();
      expect(result.expression).toBe("ctx.input.id");
    });

    it("returns null for mixed text + expression", () => {
      expect(extractWholeTemplateExpression("Hello {{name}}")).toBeNull();
    });

    it("returns null for plain text", () => {
      expect(extractWholeTemplateExpression("just text")).toBeNull();
    });

    it("returns null for non-strings", () => {
      expect(extractWholeTemplateExpression(42)).toBeNull();
      expect(extractWholeTemplateExpression(null)).toBeNull();
    });
  });
});
