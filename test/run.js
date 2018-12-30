const fontInfo = require("../dist/index");
const TTFFontPath = "./fonts/segoeui.ttf";
fontInfo.loadInfo(TTFFontPath, (err, info) => {
  // console.log(err);
  console.log(info.namesTable.fontFamily);
});
fontInfo.loadInfo(TTFFontPath).then(info => {
  console.log(info.namesTable.fontFamily);
});
let info = fontInfo.loadInfoSync(TTFFontPath);
console.log(info.namesTable.fontFamily);
