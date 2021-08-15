const Color = require('./color');

async function GetColors(ImgUrl, numcolors) {
    //Get the palette Of the image
    const paletteWorkers = await Color.getPalette(ImgUrl, numcolors);
    if (!paletteWorkers) { return undefined }
    const palettes = await Promise.all(paletteWorkers);
    return palettes

}
module.exports = GetColors