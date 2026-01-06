import { cleanFullResponse } from "@/ipc/utils/cleanFullResponse";
import { describe, it, expect } from "vitest";

describe("cleanFullResponse", () => {
  it("should replace < characters in Orbix-write attributes", () => {
    const input = `<Orbix-write path="src/file.tsx" description="Testing <a> tags.">content</Orbix-write>`;
    const expected = `<Orbix-write path="src/file.tsx" description="Testing ＜a＞ tags.">content</Orbix-write>`;

    const result = cleanFullResponse(input);
    expect(result).toBe(expected);
  });

  it("should replace < characters in multiple attributes", () => {
    const input = `<Orbix-write path="src/<component>.tsx" description="Testing <div> tags.">content</Orbix-write>`;
    const expected = `<Orbix-write path="src/＜component＞.tsx" description="Testing ＜div＞ tags.">content</Orbix-write>`;

    const result = cleanFullResponse(input);
    expect(result).toBe(expected);
  });

  it("should handle multiple nested HTML tags in a single attribute", () => {
    const input = `<Orbix-write path="src/file.tsx" description="Testing <div> and <span> and <a> tags.">content</Orbix-write>`;
    const expected = `<Orbix-write path="src/file.tsx" description="Testing ＜div＞ and ＜span＞ and ＜a＞ tags.">content</Orbix-write>`;

    const result = cleanFullResponse(input);
    expect(result).toBe(expected);
  });

  it("should handle complex example with mixed content", () => {
    const input = `
      BEFORE TAG
  <Orbix-write path="src/pages/locations/neighborhoods/louisville/Highlands.tsx" description="Updating Highlands neighborhood page to use <a> tags.">
import React from 'react';
</Orbix-write>
AFTER TAG
    `;

    const expected = `
      BEFORE TAG
  <Orbix-write path="src/pages/locations/neighborhoods/louisville/Highlands.tsx" description="Updating Highlands neighborhood page to use ＜a＞ tags.">
import React from 'react';
</Orbix-write>
AFTER TAG
    `;

    const result = cleanFullResponse(input);
    expect(result).toBe(expected);
  });

  it("should handle other Orbix tag types", () => {
    const input = `<Orbix-rename from="src/<old>.tsx" to="src/<new>.tsx"></Orbix-rename>`;
    const expected = `<Orbix-rename from="src/＜old＞.tsx" to="src/＜new＞.tsx"></Orbix-rename>`;

    const result = cleanFullResponse(input);
    expect(result).toBe(expected);
  });

  it("should handle Orbix-delete tags", () => {
    const input = `<Orbix-delete path="src/<component>.tsx"></Orbix-delete>`;
    const expected = `<Orbix-delete path="src/＜component＞.tsx"></Orbix-delete>`;

    const result = cleanFullResponse(input);
    expect(result).toBe(expected);
  });

  it("should not affect content outside Orbix tags", () => {
    const input = `Some text with <regular> HTML tags. <Orbix-write path="test.tsx" description="With <nested> tags.">content</Orbix-write> More <html> here.`;
    const expected = `Some text with <regular> HTML tags. <Orbix-write path="test.tsx" description="With ＜nested＞ tags.">content</Orbix-write> More <html> here.`;

    const result = cleanFullResponse(input);
    expect(result).toBe(expected);
  });

  it("should handle empty attributes", () => {
    const input = `<Orbix-write path="src/file.tsx">content</Orbix-write>`;
    const expected = `<Orbix-write path="src/file.tsx">content</Orbix-write>`;

    const result = cleanFullResponse(input);
    expect(result).toBe(expected);
  });

  it("should handle attributes without < characters", () => {
    const input = `<Orbix-write path="src/file.tsx" description="Normal description">content</Orbix-write>`;
    const expected = `<Orbix-write path="src/file.tsx" description="Normal description">content</Orbix-write>`;

    const result = cleanFullResponse(input);
    expect(result).toBe(expected);
  });
});
