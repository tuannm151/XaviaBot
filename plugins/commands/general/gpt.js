import axios from "axios";
const config = {
    name: "gpt",
    description: "AI GPT Chatbot",
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

async function onCall({ message, args, getLang, data: { user } }) {
    try {
        if (!args[0]) return message.reply(getLang("noMessage"));
        const input = args.join(" ");

        if (input === 'newchat') {
            global.gpt_session[user.userID] = null;
            return message.reply('Đã tạo cuộc hội thoại mới cho bạn.');
        }

        const data = {
            message: input,
        }

        if (global.gpt_session?.[user.userID]) {
            data.conversationId = global.gpt_session[user.userID].conversationId;
            data.parentMessageId = global.gpt_session[user.userID].parentMessageId;
        }

        const result = await axios.post(global.gpt_endpoint, data, {
            headers: {
                Authorization: `minhtuandev`
            }
        });

        const responseData = result.data;

        global.gpt_session[user.userID] = {
            conversationId: responseData.conversationId,
            parentMessageId: responseData.messageId
        };

        await message.reply(responseData.response);
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