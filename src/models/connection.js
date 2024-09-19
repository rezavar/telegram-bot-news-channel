import {TelegramClient, Api} from 'telegram';
import {StringSession} from 'telegram/sessions/index.js';
import {API_HASH, API_ID, BOT_TOKEN} from "../config/main-local.js";
import {getSession, setSession} from "./sessionModel.js";
import input from 'input';
import {saveDefaultChannel, saveDefaultGroup, saveMe} from "../controllers/clientController.js";
import {getDefaultGroup, getDefaultUser} from "./config.js";

let client = null;
let bot = null;

export const getTelegramClient = async () => {

    if (!client) {
        const savedSessionString = getSession();
        client = new TelegramClient(
            new StringSession(savedSessionString),
            API_ID,
            API_HASH,
            {connectionRetries: 5}
        );
        if (!savedSessionString) {
            console.log('Loading interactive');
            const config = {
                phoneNumber: async () => await input.text('Please enter your number: '),
                password: async () => await input.text('Please enter your password: '),
                phoneCode: async () => await input.text('Please enter the code you received: '),
                onError: (err) => console.log(err),
            }
            await client.start(config);
            console.log('You are now connected.');
            setSession(client.session.save());
            await saveMe(client, config.phoneNumber())
            await saveDefaultGroup(client)
            await saveDefaultChannel(client)
            console.log('Session saved');
        } else {
            const defaultUser = await getDefaultUser()
            const defaultGroup = await getDefaultGroup()
            if (defaultUser?.phone && defaultGroup?.id) {
                await client.connect();
                console.log('You are now connected.');
            } else {
                setSession('')
                console.log('please try again. default user and group not define');
                process.exit(2)
            }
        }
        console.log('Telegram client started');
    }

    return client;
};

export const getTelegramBot = async () => {
    if (!bot) {
        bot = new TelegramClient(
            new StringSession(''),
            API_ID,
            API_HASH,
            {connectionRetries: 5}
        );
        await bot.start({
            botAuthToken: BOT_TOKEN
        });


        console.log('Telegram bot started');
    }
    return bot;
};
