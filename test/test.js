const cmap = require("../dist/index");
const TTFFontPath = "./fonts/segoeui.ttf";
const TTFCorruptedFontPath = "./fonts/mstmc.ttf";
test("Parse ttf font Sync", () => {
  let _cmap = cmap.loadCmapSync(TTFFontPath);

  expect(Array.isArray(_cmap.glyphIndexArray)).toBe(true);
});
test("Parse ttf font cmap Async", () => {
  cmap.loadCMap(TTFFontPath, (err, _cmap) => {
    expect(Array.isArray(_cmap.glyphIndexArray)).toBe(true);
  });
});
test("Parse ttf font cmap Promise", () => {
  cmap.loadCMap(TTFFontPath).then(_cmap => {
    expect(Array.isArray(_cmap.glyphIndexArray)).toBe(true);
  });
});
test("Parse corrupted ttf font Sync", () => {
  let _cmap = null;
  try {
    cmap = cmap.loadCmapSync(TTFCorruptedFontPath);
  } catch (error) {
    expect(error instanceof Error).toBe(true);
    console.log(error);
  }
  expect(_cmap).toBeNull();
});
test("Parse corrupted ttf font cmap Async", () => {
  cmap.loadCMap(TTFFontPath, (err, _cmap) => {
    expect(Array.isArray(_cmap.glyphIndexArray)).toBe(true);
  });
});
test("Parse corrupted ttf font cmap Promise", () => {
  cmap.loadCMap(TTFFontPath).then(_cmap => {
    expect(Array.isArray(_cmap.glyphIndexArray)).toBe(true);
  });
});
