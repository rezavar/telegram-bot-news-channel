import {setupHandlersClient} from "./clientController.js";
import {getTelegramBot, getTelegramClient} from "../models/connection.js";
import {getDefaultGroup} from "../models/config.js";
import {btn_publishNews} from "../services/bot/buttons.js";
import {setupJobs} from "./jobController.js";
import {setupHandlersBot} from "./botController.js";
import {Api} from "telegram";


export async function main() {

    getClientAndBot().then((res) => {
        setupJobs()
        runHandler()
    }).catch(err => {
        console.log(err)
        process.exit(2)
    })

}

async function getClientAndBot() {
    const client = await getTelegramClient()
    if (!client) {
        console.log("خطا در ایجاد کلاینت");
        process.exit(2)
    }
    const bot = await getTelegramBot()
    if (!bot) {
        console.log("خطا در ایجاد ربات");
        process.exit(2)
    }
    return true
}

async function runHandler() {
    await setupHandlersClient();
    await setupHandlersBot()
}