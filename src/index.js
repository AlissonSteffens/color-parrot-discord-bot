require('dotenv').config()
const Discord = require('discord.js')
require('discord-reply');
const client = new Discord.Client()
const prefix = process.env.COMMAND_PREFIX
const isImageUrl = require('is-image-url');
const GetColor = require('./getcolors');
const MakeImage = require('./makepaletteimg');
const fs = require("fs");
const Color = require('./color');


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
    if (command == "getcolor") {
        /*
        Get the Message that user reply(Reference Message ) and
        after it, check if is undefined, if no, we need to try to 
        get the Atts url (ImageUrl) and check, using an API, if 
        this url is an image Url.
        */
        let RefMessage = await GetReplyContent(msg);
        if (RefMessage == undefined) { return msg.lineReply('Please, use this command by replying to a message with an image!') }
        let ImgUrl = await CheckRefAttach(RefMessage)
            //If ImageUrl, is an Image, not a video etc... Enter...
            //else, send a feedback and return...

        if (isImageUrl(ImgUrl)) {
            /*Check if the user send a number of colors.
              If yes,check if number > 9, and if number < 0..
              Max Number Of Color = 9
              Default Number of Color = 9
            */
            let numcolors = +argvs[1] || 9
            if (numcolors <= 0) {
                numcolors = 9
            }
            if (numcolors > 9) {
                msg.channel.send('So far I can only get up to nine colors...')
                numcolors = 9
            }
            //Colors Name and Hex Obj  
            let colorsObj = await GetColor(ImgUrl, numcolors)
                //The palette custom Base64 Obj
            let paletteImageObj = await MakeImage(colorsObj)
                //The file is the name of the file, that we gonna dowload  to send..
            const file = await base64_decode(JSON.stringify(paletteImageObj))

            await msg.lineReply("GoGo Robo-Parrot found some colors...", { files: ["../color-parrot-discord-bot/" + file] })
                //After send the message with the Image, unlink file...
            fs.unlink(file, (err => {
                if (err) console.log(err)
            }))
        } else {
            return msg.lineReply('Humm... Something went wrong,I think this is not an image. ')
        }

    }
    if (command == "more") {
        /*
        Get the Message that user reply(Reference Message ) and
        after it, check if is undefined, if no, we need to try to 
        get the Atts url (ImageUrl) and check, using an API, if 
        this url is an image Url.
        */

        let InitialMessage = await GetOriginalMessage(msg)
        if (InitialMessage == undefined) { return msg.lineReply(`Please, use this command by replying to my answer (First Use ${prefix}GetColor replying to the image).`) }
        let ImgUrl = await CheckRefAttach(InitialMessage)
        if (isImageUrl(ImgUrl)) {
            let Colors = await GetColor(ImgUrl)
            if (Colors.length <= 1) { return msg.lineReply('Hummm... This image no longer has colors!') }
            if (Colors.length <= 9) { msg.lineReply(`Hummm...This image doesn't have more than 9 colors... So I'll send all it has.`) }
            let paletteImageObj = await MakeImage(Colors)

            if (!paletteImageObj) { return msg.lineReply('Humm...I think there are no more colors in this image, sorry.') }
            const file = await base64_decode(JSON.stringify(paletteImageObj))
            await msg.lineReply("GoGo Robo-Parrot found some more awesome colors!", { files: ["../color-parrot-discord-bot/" + file] })
                //After send the message with the Image, unlink file...
            fs.unlink(file, (err => {
                if (err) console.log(err)
            }))
        } else {
            return msg.lineReply('Humm... Something went wrong,I think this is not an image. ')
        }
    }
    if (command == "help") {
        const HelpEmbed = new Discord.MessageEmbed()
            .setTitle(`Tada! I present to you, the power of the parrots.`)
            .addField(`Use ${prefix}getcolor and i gonna take the color palette of your image!`, value = `Use the command responding to an image with ${prefix}getcolor and the number of colors you want, for now the maximum color I can get is 9, if you don't send a number of colors, the default sent is 6 colors. If you want more colors, reply my msg with ${prefix}more.`, inline = false)
            .setColor('#7a58c1')
            .setImage('https://pbs.twimg.com/profile_images/1390699453934342156/Zo1enErC.jpg');
        return msg.channel.send(HelpEmbed)
    }

})
async function GetOriginalMessage(msg) {
    /*
        In this Function, we need to receive the first Message, and it's the first
        of the three messages, so we have to get the content of the answer 3 times,
        and we have the initial message with the image the user wants to get
        more colors...
        */
    const ErrorMsg = `Please, use this command by replying to my answer (First Use ${prefix}GetColor replying to the image).`

    let MessageThatBotSend = await GetReplyContent(msg);
    if (!MessageThatBotSend) return undefined
    let MessageThatUserUseGetColor = await GetReplyContent(MessageThatBotSend);
    if (!MessageThatUserUseGetColor) return undefined
    let InitialMessageWithTheImg = await GetReplyContent(MessageThatUserUseGetColor);
    return InitialMessageWithTheImg
}
async function base64_decode(base64Image) {

    //Simple Base64 decode... Dowload the img, and return the Img Name (File)
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
        if (!atts) return undefined
        return msg.attachments.get(atts).url

    }
}
client.login(process.env.DISCORD_TOKEN)