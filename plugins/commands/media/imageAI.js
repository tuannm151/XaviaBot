import axios from "axios";
const config = {
    name: "img",
    description: "AI Image Generator",
    usage: "[prompt]",
    cooldown: 3,
}

const langData = {
    "en_US": {
        "error": "Error, try again later.",
        "noMessage": "Please enter a message."
    },
    "vi_VN": {
        "error": "Đã có lỗi xảy ra...",
        "noMessage": "Vui lòng nhập nội dung."
    },
}

async function onCall({ message, args, getLang }) {
    try {
        if (!args[0]) return message.reply(getLang("noMessage"));
        const input = args.join(" ");
        console.log(input);

        const response = await global.openai.createImage({
            prompt: input,
            n: 4,
            size: "1024x1024",
            response_format: "url"
        });

        Promise.race(response.data.data.map(async (url) => {
            let imgStream = await global.getStream(url.url);
            message.reply({
                attachment: imgStream
            });
        }))


    } catch (e) {
        console.error(e);
        message.reply(getLang("error"))
    }
}

export default {
    config,
    langData,
    onCall
}
