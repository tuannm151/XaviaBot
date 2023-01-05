

const config = {
    name: "ai",
    description: "AI Chatbot",
    usage: "[message]",
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

        const completion = await global.openai.createCompletion({
            model: "text-davinci-003",
            prompt: input,
            temperature: 0,
            max_tokens: 4000,
        });
        console.log(completion.data.choices);
        await message.reply(completion.data.choices[0].text);
    } catch (e) {
        console.error(e);
        message.reply(getLang("error"))
    }
};

export default {
    config,
    langData,
    onCall
}