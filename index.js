require('dotenv').config()
const Discord = require('discord.js')
require('discord-reply');
const client = new Discord.Client()
const prefix = "+"
const isImageUrl = require('is-image-url');
const colorname = require('color-name-list')
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
        console.log(ImgUrl)
        if (isImageUrl(ImgUrl)) { GetColor(ImgUrl) } else { return msg.lineReply('Humm... Something went wrong,I think this is not an image. ') }

    }
})

async function GetReplyContent(msg) {
    if (msg.reference != null) {
        let message = await msg.channel.messages.fetch(msg.reference.messageID)
        return message
    } else { return undefined }

}
async function CheckRefAttach(msg) {
    if (msg.attachments) {
        let atts = msg.attachments.keys().next().value
        console.log(atts)
        return msg.attachments.get(atts).url

    }
}
async function GetColor(url) {

}
client.login(process.env.DISCORD_TOKEN)