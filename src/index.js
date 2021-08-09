require('dotenv').config()
const Discord = require('discord.js')
require('discord-reply');
const client = new Discord.Client()
const prefix = "+"
const isImageUrl = require('is-image-url');
const Color = require('./color');
const MakeImage = require('./image');
const fs = require("fs");

client.on('ready', async() => {
    console.log(`Logged in as ${client.user.tag}!`)
});
client.on('message', async msg => {

    if (msg.author.bot) return
    let command = ''
    const argvs = msg.content.split(" ");
    if (argvs[0].startsWith(prefix)) {
        command = argvs[0].replace(prefix, "").toLocaleLowerCase();
    } else {
        return
    }
    if (command = "getcolor") {
        let RefMessage = await GetReplyContent(msg);
        if (RefMessage == undefined) { return msg.lineReply('Please, use this command by replying to a message with an image!') }
        let ImgUrl = await CheckRefAttach(RefMessage)
        if (isImageUrl(ImgUrl)) {

            let colorsArray = await Color(ImgUrl)
            let palletImageObj = await MakeImage(colorsArray)
            const file = await base64_decodeAndSendEmbed(JSON.stringify(palletImageObj))


            await msg.lineReply("The Palette of your image.", { files: ["../color-parrot-discord-bot/" + file] })
            fs.unlink(file, (err => {
                if (err) console.log(err)
            }))
        } else {
            return msg.lineReply('Humm... Something went wrong,I think this is not an image. ')
        }

    }
})
async function base64_decodeAndSendEmbed(base64Image) {
    let file = new Date().getTime() + Math.random().toString(16).substr(2);
    file += '.png';
    fs.writeFile(file, base64Image, { encoding: 'base64' }, function(err) {});
    return file

}
async function GetReplyContent(msg) {
    if (msg.reference != null) {
        let message = await msg.channel.messages.fetch(msg.reference.messageID)
        return message
    } else { return undefined }

}
async function CheckRefAttach(msg) {
    if (msg.attachments) {
        let atts = msg.attachments.keys().next().value
        return msg.attachments.get(atts).url

    }
}
client.login(process.env.DISCORD_TOKEN)