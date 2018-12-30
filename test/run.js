const fontInfo = require("../dist/index");
const TTFFontPath = "./fonts/segoeui.ttf";
fontInfo.loadInfo(TTFFontPath, (err, info) => {
  // console.log(err);
  console.log(info.namesTable);
});
