import { resolve as resolvePath } from 'path';
import { Configuration, OpenAIApi } from "openai";
import axios from 'axios';

const _global = {
    mainPath: resolvePath(process.cwd()),
    corePath: resolvePath(process.cwd(), 'core'),
    cachePath: resolvePath(process.cwd(), 'core', 'var', 'data', 'cache'),
    assetsPath: resolvePath(process.cwd(), 'core', 'var', 'assets'),
    config: new Object(),
    modules: new Map(),
    getLang: null,
    // Plugins:
    pluginsPath: resolvePath(process.cwd(), 'plugins'),
    plugins: new Object({
        commands: new Map(),
        commandsAliases: new Map(),
        commandsConfig: new Map(),
        customs: new Number(0),
        events: new Map(),
        onMessage: new Map()
    }),
    client: new Object({
        cooldowns: new Map(),
        replies: new Map(),
        reactions: new Map()
    }),
    // Data
    data: new Object({
        models: new Object(),
        users: new Map(),
        threads: new Map(),
        langPlugin: new Object(),
        langSystem: new Object(),
        messages: new Array(),
        temps: new Array()
    }),
    listenMqtt: null,
    api: null,
    botID: null,
    updateJSON: null,
    updateMONGO: null,
    controllers: null,
    xva_api: null,
    xva_ppi: null,
    server: null,
    refreshState: null,
    refreshMqtt: null,
    mongo: null,
    openai: null,
    restart: restart,
    shutdown: shutdown,
    maintain: false,
    openai_apikeys: new Array(),
    gpt_session: new Object(),
}

function _change_prototype_DATA(data) {
    data.users.set = function (key, value) {
        value.lastUpdated = Date.now();
        return Map.prototype.set.call(this, key, value);
    }

    data.threads.set = function (key, value) {
        value.lastUpdated = Date.now();
        return Map.prototype.set.call(this, key, value);
    }

    return data;
}
async function getDomains() {
    try {
        const response = await axios.get('https://raw.githubusercontent.com/XaviaTeam/XaviaAPIs/main/domains.json');
        return response.data;
    } catch (error) {
        throw error;
    }
}

async function _init_global() {
    const domains = await getDomains();
    // get apikeys from env separated by ,
    const openai_apikeys = process.env.OPENAI_APIKEYS.split(',');
    const openai_config = new Configuration({
        apiKey: openai_apikeys[0],
    });

    global.mainPath = _global.mainPath;
    global.corePath = _global.corePath;
    global.cachePath = _global.cachePath;
    global.assetsPath = _global.assetsPath;
    global.config = _global.config;
    global.modules = _global.modules;
    global.getLang = _global.getLang;
    // Plugins:
    global.pluginsPath = _global.pluginsPath;
    global.plugins = _global.plugins;

    global.client = _global.client;
    // Data
    global.data = _change_prototype_DATA(_global.data);
    // FCA
    global.listenMqtt = _global.listenMqtt;
    global.api = _global.api;
    global.botID = _global.botID;
    global.updateJSON = _global.updateJSON;
    global.updateMONGO = _global.updateMONGO;
    global.controllers = _global.controllers;
    global.xva_api = domains.xP22;
    global.xva_ppi = domains.xP21;
    global.server = _global.server;
    global.refreshState = _global.refreshState;
    global.refreshMqtt = _global.refreshMqtt;
    global.mongo = _global.mongo;
    global.restart = _global.restart;
    global.shutdown = _global.shutdown;
    global.maintain = _global.maintain;
    global.openai = new OpenAIApi(openai_config);
    global.gpt_endpoint = process.env.GPT_ENDPOINT || undefined;
    global.gpt_authKey = process.env.GPT_AUTHKEY || undefined;
    global.ai_endpoint = process.env.AI_ENDPOINT || undefined;
    global.ai_authKey = process.env.AI_AUTHKEY || undefined;
    global.gpt_session = _global.gpt_session;
    global.axios = axios;
}

async function clear() {
    clearInterval(global.refreshState);
    clearInterval(global.refreshMqtt);
    if (global.server !== null) await global.server.close();
    if (global.mongo !== null) await global.mongo.close();
    if (global.listenMqtt !== null) await global.listenMqtt.stopListening();

    for (const global_prop in _global) {
        delete global[global_prop];
    }
    global.gc();
}

async function restart() {
    await clear();
    process.exit(1);
}


async function shutdown() {
    await clear();
    process.exit(0);
}

export default _init_global;
