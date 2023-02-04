import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import axios from 'axios';

import { readFileSync } from 'fs';

const commands = [
    "help",
    "restart",
    "shutdown",
    "version"
]

function startServer(serverAdminPassword) {
    const logger = global.modules.get('logger');
    const app = express();
    const port = process.env.PORT || 3000;

    app.use(express.json());
    app.use(express.static(path.resolve('core/dashboard/public')));

    app.use(cors());
    app.use(helmet());

    app.get('/', (req, res) => {
        res.sendFile(path.resolve('core/dashboard/public', 'index.html'));
    });

    app.use((req, res, next) => {
        if (req.headers['xva-access-token'] != serverAdminPassword) return res.status(401).send('Unauthorized');
        next();
    });

    app.get('/getConfig', (req, res) => {
        const config = global.config;
        return res.status(200).json({ config });
    });

    app.put('/commands', (req, res) => {
        const { command } = req.body;
        if (!command) return res.status(400).send('Bad Request');
        if (!commands.includes(command)) return res.status(400).send('Bad Request');

        let returnData = {};
        switch (command) {
            case "help":
                returnData = {
                    commands: commands
                }
                break;
            case "restart":
                global.restart();
                returnData = {
                    message: "Restarted"
                }
                break;
            case "shutdown":
                global.shutdown();
                returnData = {
                    message: "Shutdown"
                }
                break;
            case "version":
                returnData = {
                    version: JSON.parse(readFileSync(path.resolve('package.json'))).version
                }
                break;

            default:
                return res.status(400).send('Bad Request');
        }

        return res.status(200).json(returnData);
    });

    global.server = app.listen(port, () => {
        logger.system(getLang("build.start.serverStarted", { port, serverAdminPassword }));
    });

    app.post('/noti', (req, res) => {
        const { type, message } = req.body;
        const { api } = global;
        const debugThreadID = global.config?.DEBUG_THREAD_ID;

        if (!debugThreadID) return res.status(400).send({
            error: "Debug Thread ID not set",
        });
        if (!type || !message) return res.status(400).send({
            error: "Missing type or message",
        });

        switch (type) {
            case "info":
                logger.info(message);
                break;
            case "error":
                logger.error(message);
                break;
            default:
                return res.status(400).send({
                    error: "Invalid type",
                });
        }
        api.sendMessage(message, debugThreadID);
        return res.status(200).send({
            message: "message sent",
        });
    });

    if (global.config.AUTO_PING_SERVER) {
        const { isReplit, isGlitch } = global.modules.get('environments.get');
        let webURL;
        if (isReplit) webURL = `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`;
        else if (isGlitch) webURL = `https://${process.env.PROJECT_DOMAIN}.glitch.me`;
        else return;

        axios.post(`${global.xva_ppi}/add`, {
            url: webURL
        }, {
            headers: {
                "Content-Type": "application/json"
            }
        }).catch(e => console.error(e));
    }
}

export default startServer;
