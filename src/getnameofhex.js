const Color = require('./color');
const hexColorRegex = require("hex-color-regex");
require('discord-reply');
async function NameOfTheHex(msg, userMessageArray) {
    const { namedColors, namedColorsMap, closest } = await Color.getNamedColors();
    let validHex = false;
    let hex;
    let rgb;
    let color;
    let closestColor;

    const hexColor = userMessageArray.find(c => hexColorRegex().test(c));
    if (hexColor) {
        hex = hexColorRegex().exec(hexColor)[0];
        rgb = Color.hexToRgb(hex);
        validHex = true;
    }

    if (!validHex) {
        msg.lineReply(`Hummmm.... Sorry but our robo-parrots don't find any Valid Hex color...`);
    } else if (namedColorsMap.has(hex)) {
        msg.lineReply(`Tada! Our robo-parrots says that the name of  **${hex} ** is  ** ${namedColorsMap.get(hex)} **`);
    } else {
        closestColor = closest.get([rgb.r, rgb.g, rgb.b]);
        color = namedColors[closestColor.index];
        msg.lineReply(`Oh our robo-parrots says that your closest color is **${color.name} ** and hex is  **${color.hex} **`);
    }
}

module.exports = NameOfTheHex