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

        if (!global.db) {
            await message.reply("Try again later...");
        }

        const data = {
            message: input,
        }
        console.log(global.db.exec(`SELECT * FROM message`));
        // if this message is a reply to another message
        if (message.messageReply) {
            const messageID = message.messageReply.messageID;
            // query db to get parentMsgId and conversationId
            const query = `SELECT * FROM message WHERE msgId = '${messageID}' limit 1;`
            const queryResult = global.db.exec(query);
            if (queryResult.length > 0) {
                const result = queryResult[0].values[0];
                data.conversationId = result[1];
                data.parentMessageId = result[2];
            }
        }
        const result = await global.axios.post(global.gpt_endpoint + '/conversation', data, {
            headers: {
                Authorization: global.gpt_authKey || ""
            }
        });

        const responseData = result.data;

        const replyMsg = await message.reply(responseData.response)

        const query = `INSERT INTO message (msgId, conversationId, parentMsgId) VALUES ('${replyMsg.messageID}', '${responseData.conversationId}', '${responseData.messageId}');`;
        global.db.run(query);
        global.db.save();


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