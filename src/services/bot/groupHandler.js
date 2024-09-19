import {Api} from "telegram";
import {findAdminById} from "../../models/adminList.js";
import {getTelegramBot, getTelegramClient} from "../../models/connection.js";
import {btn_callBackData} from "./buttons.js";
import {publishNews, rejectNews} from "../../controllers/clientController.js";
import {getDefaultGroup} from "../../models/config.js";


export async function botGroupHandlers(event) {

    if (!event) {
        return;
    }

    if (event?.query?.className !== 'UpdateBotCallbackQuery') {
        console.log("!className")
        return;
    }

    const userId = Number(event.query.userId.value || 0);
    const queryId = event.query.queryId.value;
    const user = await findAdminById(userId);
    const messageId = event.query.msgId;
    const command = event?.query?.data?.toString('utf-8')

    const callbackError = async (_queryId, msg, showAlert = true) => {
        const bot = await getTelegramBot()
        await bot.invoke(
            new Api.messages.SetBotCallbackAnswer({
                queryId: _queryId,
                text: msg,
                showAlert: showAlert
            })
        );
    }

    if (!command || command.includes('_')) {
        return;
    }
    if (!userId) {
        console.log('!userId')
        return;
    }
    if (!queryId) {
        console.log('!queryId')
        return;
    }
    if (!user) {
        callbackError(queryId, 'شما مجاز به تایید یا رد پیام نیستید.').then(() => {
            console.log('!user')
        })
        return;
    }
    if (!user.isAdmin) {
        callbackError(queryId, 'شما مجاز به تایید یا رد پیام نیستید.').then(() => {
            console.log('!isAdmin')
        })
        return;
    }
    if (user?.isMaster) {
        callbackError(queryId, 'کاربر اصلی مجاز به تایید/رد نیست.').then(() => {
            console.log('!isMaster')
        })
        return;
    }
    if (!messageId) {
        callbackError(queryId, 'ایراد شناسایی پیام.').then(() => {
            console.log('!messageId')
        })
        return;
    }

    if (command === btn_callBackData.manageNewsAccept)
        await _callbackNews(user.userName, queryId, messageId, true);
    else if (command === btn_callBackData.manageNewsReject)
        await _callbackNews(user.userName, queryId, messageId, false);

    return false;
}

async function _readMessageFromGroup(messageId) {
    const client = await getTelegramClient()
    const defaultGroup = await getDefaultGroup();
    const history = await client.invoke(
        new Api.messages.GetHistory({
            peer: defaultGroup.id,
            offsetId: messageId,
            limit: 1,
        })
    );
    const message = history.messages[0];
    if (!message) {
        return {};
    }
    if (message?.media) {
        return {
            message: message?.message,
            media: message?.media,
        }
    } else
        return {
            message: message?.message,
            media: false,
        }
}

async function _callbackNews(userName, queryId, messageId, accept) {

    const bot = await getTelegramBot()
    const message = await _readMessageFromGroup();
    let alertMsg = 'بررسی پیام گروه';
    let alertShow = false;

    if (!(message?.message)) {
        alertShow = true
        alertMsg = 'خطا در خواندن متن پیام'
    }

    await bot.invoke(
        new Api.messages.SetBotCallbackAnswer({
            queryId: queryId,
            text: alertMsg,
            showAlert: alertShow
        })
    );
    if (accept)
        return publishNews(userName, messageId, message)
    return rejectNews(userName, messageId, message)
}