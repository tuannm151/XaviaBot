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

        const data = {
            message: input,
        }

        // if this message is a reply to another message
        if (message.messageReply) {
            const messageID = message.messageReply.messageID;
            data.replyMsgId = messageID;
        }
        if (global.gpt_endpoint == undefined) {
            throw new Error("GPT_ENDPOINT is not defined");
        }
        const result = await global.axios.post(global.gpt_endpoint + '/conversation', data, {
            headers: {
                Authorization: global.gpt_authKey || ""
            }
        });

        const responseData = result.data;

        const replyMsg = await message.reply(responseData.response)

        // save metadata to db
        global.axios.post(global.gpt_endpoint + '/message/register', {
            messageId: responseData.messageId,
            replyMsgId: replyMsg.messageID,
            conversationId: responseData.conversationId,
        }, {
            headers: {
                Authorization: global.gpt_authKey || ""
            }
        });


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