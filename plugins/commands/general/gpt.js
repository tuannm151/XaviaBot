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
            content: input,
        }

        if (global.gpt_session?.[user.userID]) {
            data.conversation_id = global.gpt_session[user.userID].conversation_id;
            data.parent_id = global.gpt_session[user.userID].parent_id;
        }

        const result = await axios.post(global.gpt_endpoint, data, {
            headers: {
                Authorization: `minhtuandev`
            }
        });

        const responseData = result.data;

        global.gpt_session[user.userID] = {
            conversation_id: responseData.conversation_id,
            parent_id: responseData.response_id
        };

        await message.reply(responseData.content);
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