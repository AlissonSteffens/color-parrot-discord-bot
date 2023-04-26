require('dotenv').config()
const Discord = require('discord.js')
require('discord-reply');
const client = new Discord.Client()
const prefix = process.env.COMMAND_PREFIX
const isImageUrl = require('is-image-url');
const GetColor = require('./getcolors');
const GetNameOfHex = require('./getnameofhex');
const MakeImage = require('./makepaletteimg');
const fs = require("fs");
const GetColorsCommand = ['getcolor', 'getcolors', 'colors', 'color']

client.on('ready', async() => {
    console.log(`Logged in as ${client.user.tag}!`)
});
client.on('message', async msg => {

    if (msg.author.bot) return
    let command = ''
    const argvs = msg.content.split(" ");
    if (msg.content.includes("@here") || msg.content.includes("@everyone")) return false;
    if (msg.mentions.has(client.user.id) && msg.content.includes(client.user.id)) {
        if (argvs.length <= 1) {
            return
        }
        argvs.shift()
        command = argvs[0].replace(prefix, "").toLocaleLowerCase();
    } else if (argvs[0].startsWith(prefix)) {
        command = argvs[0].replace(prefix, "").toLocaleLowerCase();
    } else {
        return
    }
    const isGetImageColorCommand = () => {


        return !(!msg.content.includes("what color is this") &&
            !msg.content.includes("what colour is this") &&
            !msg.content.includes("what color is that") &&
            !msg.content.includes("what colour is that") &&
            !msg.content.includes("what is this color") &&
            !msg.content.includes("what is this colour") &&
            !msg.content.includes("what is that color") &&
            !msg.content.includes("what is that colour") &&
            !msg.content.includes("what are those colors") &&
            !msg.content.includes("what are those colours") &&
            !msg.content.includes("what colors are in this") &&
            !msg.content.includes("what colours are in this") &&
            !msg.content.includes("what is the dominant color") &&
            !msg.content.includes("what are the colors") &&
            !msg.content.includes("what are the colours") &&
            !msg.content.includes("what colors are in this picture") &&
            !msg.content.includes("what colours are in this picture") &&
            !msg.content.includes("what colors are these") &&
            !msg.content.includes("what colours are these") &&
            !msg.content.includes("what colors are those") &&
            !msg.content.includes("what colours are those") &&
            !msg.content.includes("what are these colors") &&
            !msg.content.includes("what are these colours") &&
            !GetColorsCommand.includes(command)
        );
    };
    if (isGetImageColorCommand()) {
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
            msg.channel.send(`Just a second! i'm working on it!`)
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
            if (!colorsObj) { return msg.lineReply('Sorry but Parrots only accepts jpeg or png Images!') }
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
            msg.channel.send('You can leave it to me !')

            let Colors = await GetColor(ImgUrl)
            if (!Colors) { return msg.lineReply('Sorry but Parrots only accepts jpeg or png Images!') }
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
    if (command == "name" || msg.content.includes("what is the name of") || msg.content.includes("what's the name of")) {
        GetNameOfHex(msg, argvs)
        return
    }
    if (command == "help") {
        const HelpEmbed = new Discord.MessageEmbed()
            .setTitle(`Tada! I present to you, the power of the parrots.`)
            .setDescription(`My prefix is "**${prefix}**" or you can just mention me (Use the prefix or mention before the command).`)
            .addField(`Want the parrots in your server too?`, value = "Our robo-parrots are happy to do help you ![Add me to your server!](https://discord.com/oauth2/authorize?client_id=873156023903457280&permissions=51200&scope=bot)", inline = true)
            .setColor('#7a58c1')
            .setThumbnail('https://pbs.twimg.com/profile_images/1390699453934342156/Zo1enErC.jpg')
            .setImage('https://pbs.twimg.com/profile_banners/1109778441379950592/1627417955/1080x360')
            .addFields({ name: 'Get the color Of an Image', value: "`getcolor, color, colors, what color is this...`" }, { name: 'Get the color name of an Hex', value: "`name, what is the name of, what's the name of.`" }, { name: 'Get more colors than you think', value: '`more...(Reply in the palette that i send...)`', inline: true }, { name: 'Help Command', value: "`help... my command list.`" })
            .addField('Some Links:', value = '[GitHub Repository](https://www.youtube.com/watch?v=dQw4w9WgXcQ&ab_channel=RickAstley), [Twitter Version](https://twitter.com/color_parrot), [Twitter Repository Version](https://github.com/meodai/colorparrot-twitter-bot)')
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