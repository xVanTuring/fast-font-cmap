## Font Chars

> Node.js Only

### For What?

You can use this library to get the all char-code(unicode) from a font, supported format: TTF OTF WOFF

> woff2 will be supported soon

### How To

```js
const cmap = require("font-chars");
const fontPath = "./fonts/segoeui.ttf";
cmap.loadCMap(fontPath, (err, result) => {
  console.log(result.glyphIndexArray);
});
```

`glyphIndexArray` :

```js
glyphIndexArray = [[startUnicde, end], [start, end], [start, end]];
// include end value
```

### License

This project is based on [opentype.js](https://github.com/opentypejs/opentype.js)
If you want full support of reading font,get glyph path,create font ... on browser, the opentype.js is your best choice.
All my code is under MIT License, the fonts in fonts is test only.
