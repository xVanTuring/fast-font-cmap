const cmap = require("./dist/index");
const fontPath = "./fonts/segoeui.ttf";
cmap.loadCMap(fontPath, (err, result) => {
  if (!err) {
    console.log(result.glyphIndexArray);
  }
});
