require('dotenv').config()
const Discord = require('discord.js')
require('discord-reply');
const client = new Discord.Client()
const prefix = "+"
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
        let ImgUrl = GetReplyContent(msg);
        console.log(ImgUrl)
        if (ImgUrl == undefined) { return msg.lineReply('Please, use this command by replying to a message with an image!') }
        console.log(ImgUrl)
    }
})

function GetReplyContent(msg) {
    if (msg.reference != null) {
        let id = msg.reference.messageID
        let content = id.content
        console.log(id)
        msg.channel.messages.fetch(msg.reference.messageID)
            .then(message => { return message.content })
    } else { return undefined }

}
client.login(process.env.DISCORD_TOKEN)