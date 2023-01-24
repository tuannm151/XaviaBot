import { writeFileSync, unlinkSync } from 'fs';

const config = {
    name: "noti",
    description: "set noti on/off for group.",
    usage: "[on/off]",
    cooldown: 3,
    permissions: [1],
}

const langData = {
    "en_US": {
        "on": "Turned on receive notification",
        "alreadyOn": "Receive notification already turned on",
        "off": "Turned off receive notification",
        "alreadyOff": "Receive notification already turned off"
    },
    "vi_VN": {
        "on": "Đã bật nhận thông báo",
        "alreadyOn": "Nhận thông báo đã được bật",
        "off": "Đã tắt nhận thông báo",
        "alreadyOff": "Nhận thông báo đã được tắt"
    },
}

const setThreadID = async (threadID) => {
    global.config.DEBUG_THREAD_ID = threadID;
    const configStringified = JSON.stringify(global.config, _, 4);
    const configPathTemp = resolvePath(global.mainPath, 'config', 'config.main.temp.json');
    writeFileSync(configPathTemp, configStringified, 'utf8');
    writeFileSync(resolvePath(global.mainPath, 'config', 'config.main.json'), configStringified, 'utf8');

    unlinkSync(configPathTemp);
}

async function onCall({ message, args, getLang, data }) {
    try {
        let input = args[0]?.toLowerCase();
        const debugThreadID = global.config?.DEBUG_THREAD_ID;
        switch (input) {
            case "on":
                if (debugThreadID) return message.reply(getLang("alreadyOn"));
                setThreadID(message.threadID);
                return message.reply(getLang("on"));
            case "off":
                if (!debugThreadID) return message.reply(getLang("alreadyOff"));
                setThreadID(null);
                return message.reply(getLang("off"));
            default:
                // toggle on/off
                if (debugThreadID) {
                    setThreadID(null);
                    return message.reply(getLang("off"));
                }
                setThreadID(message.threadID);
                return message.reply(getLang("on"));
        }
    } catch (e) {
        console.error(e);
        message.reply(getLang("error"));
    }
}

export default {
    config,
    langData,
    onCall
}
