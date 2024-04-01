const Images = require('./image');

/* This function "MakeImage", need the Color Palette Obj of an image (we make it in 
"getcolor.js") and return the Base64 of the custom image that we gonna send for
the user.
*/
async function makeImage(palette) {
    const generateAndUploadCollection = async (palette) => {
        const imgBuff = await Images.generateCollection(palette);
        const imgBase64 = await Images.convertImagebuffTobase64(imgBuff);
        return imgBase64;
    };
    const paletteImageObj = await generateAndUploadCollection(palette);
    return paletteImageObj;
}
module.exports = makeImage;