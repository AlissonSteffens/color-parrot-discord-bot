require('dotenv').config()
const Discord = require('discord.js')
require('discord-reply');
const client = new Discord.Client()
const prefix = "+"
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
        let ImgUrl = GetReplyContent(msg);
        if (ImgUrl = undefined) { return msg.lineReply('Please, use this command by replying to a message with an image!') }
        console.log(ImgUrl)
    }
})

function GetReplyContent(msg) {
    var content;
    try {
        msg.channel.messages.fetch(msg.reference.messageID)
            .then(message => content = message.content)
    } catch { return content = undefined }
    return content
}