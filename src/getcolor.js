const Color = require('./color');
const path = require("path");
const request = require("request");
const ImageData = require("@andreekeberg/imagedata");
const PaletteExtractor = require("./vendor/palette-extractor");
const fs = require("fs");

async function download(uri, filename) {
    return new Promise((resolve, reject) => {
        request.head(uri, (err, res) => {
            if (err) {
                reject(err);
            } else {
                request(uri).pipe(fs.createWriteStream(filename)).on("close", resolve);
            }
        });
    });
}

/*We Gonna export this function GetColor, to use in index.js, when
  "getcolor" command is called, to return the Color Pallet Obj of an Image.
*/
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
            const colorCount = numColors || 9;
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