const fs = require("fs");
const axios = require("axios");
const ClosestVector = require("../node_modules/closestvector/.");
const path = require("path");
const request = require("request");
const ImageData = require("@andreekeberg/imagedata");
const PaletteExtractor = require("./vendor/palette-extractor");
const CACHE_UPDATE_INTERVAL = 1000 * 60 * 60 * 24 * 3;

//All Functions we gona need to get the color pallet of an Image.
let namedColorsMap;
let rgbColorsArr;
let namedColorsExp;
let closest;
let lastColorsUpdateTime = -1;
const RGB_HEX = /^#?(?:([\da-f]{3})[\da-f]?|([\da-f]{6})(?:[\da-f]{2})?)$/i;
const Color = {};
const setupColors = (namedColors) => {
    namedColorsMap = new Map();
    rgbColorsArr = [];
    namedColorsExp = [...namedColors];

    namedColorsExp.forEach((c) => {
        const rgb = Color.hexToRgb(c.hex);
        namedColorsMap.set(c.hex, c.name);

        // populates array needed for ClosestVector()
        rgbColorsArr.push([rgb.r, rgb.g, rgb.b]);
        // transform hex to RGB
        c.rgb = rgb;
        // calculate luminancy for each color
        c.luminance = Color.luminance(rgb);
    });

    closest = new ClosestVector(rgbColorsArr);
};
Color.rgbToHex = ({ r, g, b }) => {
    const s = (x) => x.toString(16).padStart(2, "0");
    return "#" + s(r) + s(g) + s(b);
};
/**
 * Fetches the named colors list using the API and caches it. Subsequent
 * calls will return cached version.
 */
Color.getNamedColors = async() => {
    const now = new Date().getTime();
    if (!namedColorsExp || now - lastColorsUpdateTime >= CACHE_UPDATE_INTERVAL) {
        const { data } = await axios.get("https://api.color.pizza/v1/");
        setupColors(data.colors);
        lastColorsUpdateTime = now;
    }

    return {
        namedColors: namedColorsExp,
        namedColorsMap,
        closest,
    };
};
Color.hexToRgb = (hexSrt) => {
    const [, short, long] = String(hexSrt).match(RGB_HEX) || [];

    if (long) {
        const value = Number.parseInt(long, 16);
        return {
            r: value >> 16,
            g: (value >> 8) & 0xff,
            b: value & 0xff,
        };
    }

    if (short) {
        const rgbArray = Array.from(short, (s) => Number.parseInt(s, 16)).map(
            (n) => (n << 4) | n
        );
        return {
            r: rgbArray[0],
            g: rgbArray[1],
            b: rgbArray[2],
        };
    }

    return null;
};
Color.luminance = (rgb) => Math.sqrt(
    Math.pow(0.299 * rgb.r, 2) +
    Math.pow(0.587 * rgb.g, 2) +
    Math.pow(0.114 * rgb.b, 2)
);
async function download(uri, filename) {
    return new Promise((resolve, reject) => {
        request.head(uri, (err, res) => {
            if (err) {
                reject(err);
            } else {
                console.log("content-type:", res.headers["content-type"]);
                console.log("content-length:", res.headers["content-length"]);

                request(uri).pipe(fs.createWriteStream(filename)).on("close", resolve);
            }
        });
    });
}

//Now with all functions set, that async function GetColor can be used ...
//Its will be called in de Index.js, when a user use the command... Line 21.

async function GetColor(imageURL, numColors) {
    const { namedColors, namedColorsMap, closest } = await Color.getNamedColors();

    const ext = path.extname(imageURL);
    let file = new Date().getTime() + Math.random().toString(16).substr(2);
    file += ext;

    // download image to local disk
    await download(imageURL, file);

    return new Promise((res, rej) => {
        ImageData.get(file, (err, { data }) => {
            if (err) {
                rej(err);
                return;
            }

            const paletteExtractor = new PaletteExtractor();
            //Deixar por padrão para ver se está funcionando por enquando, o certo é o outro comentado.
            const colorCount = numColors
                //const colorCount = numColors || config.MAX_PALETTE_COLORS;
            const colors = paletteExtractor.processImageData(data, colorCount);

            const usableColors = colors.map((hex) => {
                let name = namedColorsMap.get(hex);

                if (!name) {
                    const rgb = Color.hexToRgb(hex);
                    const closestColor = closest.get([rgb.r, rgb.g, rgb.b]);
                    const c = namedColors[closestColor.index];
                    name = c.name;
                    hex = c.hex;
                }
                //Now With The color Pallet, we gona return  to Index.js and after, make img...
                return { name, hex };
            });

            fs.unlink(file, (err) => {
                if (err) {
                    rej(err);
                } else {
                    res(usableColors);
                }
            });
        });
    });
}
module.exports = GetColor