const Color = require('./color');
const hexColorRegex = require("hex-color-regex");
require('discord-reply');
const ClosestVector = require("../node_modules/closestvector/.");

async function NameOfTheHex(msg, userMessageArray) {

    const {
        namedColorsMap,
        closest,
    } = await Color.getNamedColors();
    let validHex = false;
    let hex;
    let rgb;
    let color;
    let closestColor;
    for (const c of userMessageArray) {
        if (hexColorRegex().test(c)) {
            const match = hexColorRegex().exec(c);
            if (!match) continue;

            hex = match[0];
            rgb = Color.hexToRgb(hex);
            validHex = true;

            break;
        }
    }
    if (!validHex) {
        msg.lineReply(`Hummmm.... Sorry but our robo-parrots don't find any Valid Hex color...`)

    } else if (namedColorsMap.get(hex)) {

        msg.lineReply(`Tada! Our robo-parrots says that the name of  **${hex} ** is  ** ${namedColorsMap.get(hex)} **`)
    } else {
        // get the closest named colors
        closestColor = new ClosestVector([rgb.r, rgb.g, rgb.b]);
        const s = (x) => x.toString(16).padStart(2, "0");
        hex = "#" + s(closestColor.list[0]) + s(closestColor.list[1]) + s(closestColor.list[2])
        color = namedColorsMap.get(hex)


        msg.lineReply(`Oh our robo-parrots says that your closest color is **${color} ** and hex is  **${hex} **`)
    }

}

module.exports = NameOfTheHex