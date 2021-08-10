const { cpuUsage } = require('process');
const Color = require('./color');
const Images = require('./image');

async function GetMoreColors(ImgUrl) {
    //Get the palette Of the image
    const paletteWorkers = await Color.getPalette(ImgUrl);
    const palettes = await Promise.all(paletteWorkers);
    return palettes

}
module.exports = GetMoreColors