const { readFileSync, writeFileSync } = require("fs");

const inputFile = "./themes/Pacific Default Dark Theme-color-theme.json copy";
const outputFile = "./themes/Pacific Default Dark Theme-color-theme.json";

var json = JSON.parse(readFileSync(inputFile, "utf-8"));

const isValidHex = (hex) => /^#([A-Fa-f0-9]{3,4}){1,2}$/.test(hex);

const getChunksFromString = (st, chunkSize) =>
  st.match(new RegExp(`.{${chunkSize}}`, "g"));

const convertHexUnitTo256 = (hexStr) =>
  parseInt(hexStr.repeat(2 / hexStr.length), 16);

const getAlphafloat = (a, alpha) => {
  if (typeof a !== "undefined") {
    return a / 255;
  }
  if (typeof alpha != "number" || alpha < 0 || alpha > 1) {
    return 1;
  }
  return alpha;
};

const hexToRGBA = (hex, alpha) => {
  if (!isValidHex(hex)) {
    throw new Error("Invalid HEX");
  }
  const chunkSize = Math.floor((hex.length - 1) / 3);
  const hexArr = getChunksFromString(hex.slice(1), chunkSize);
  const [r, g, b, a] = hexArr.map(convertHexUnitTo256);
  return [r, g, b, a || 1];
};

function hslToRgb(h, s, l) {
  var r, g, b;

  if (s == 0) {
    r = g = b = l; // achromatic
  } else {
    var hue2rgb = function hue2rgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function rgbToHsl(r, g, b) {
  (r /= 255), (g /= 255), (b /= 255);
  var max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  var h,
    s,
    l = (max + min) / 2;

  if (max == min) {
    h = s = 0; // achromatic
  } else {
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return [h, s, l];
}

function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b, a) {
  if (a === 255) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
  }
  return (
    "#" +
    componentToHex(r) +
    componentToHex(g) +
    componentToHex(b) +
    componentToHex(a)
  );
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(v, max));
}

json.tokenColors.forEach((tokenColor) => {
  if (tokenColor.settings?.foreground) {
    var [r, g, b, a] = hexToRGBA(tokenColor.settings.foreground);

    var [h, s, l] = rgbToHsl(r, g, b);

    s += 0.01;
    l += 0.01;

    h = clamp(h, 0, 1);
    s = clamp(s, 0, 1);
    l = clamp(l, 0, 1);

    var newHex = rgbToHex(...hslToRgb(h, s, l), a * 255);

    tokenColor.settings.foreground = newHex;
  }
});

var output = JSON.stringify(json, null, 2);
writeFileSync(outputFile, output, {
  encoding: "utf-8",
});
