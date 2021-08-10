const Images = require('./image');

/* This function "MakeImage", need the Color Palette Obj of an image (we make it in 
"getcolor.js") and return the Base64 of the custom image that we gonna send for
the user.
*/
async function MakeImage(palette) {
    const generateAndUploadCollection = async(palette) => {
        const imgBuff = Images.generateCollection(palette);
        const imgBase64 = Images.convertImagebuffTobase64(imgBuff);
        return imgBase64
    };
    const palletImageObj = await generateAndUploadCollection(palette);
    return palletImageObj
}
module.exports = MakeImage;