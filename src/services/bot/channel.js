import {channelToString, getChannelInfo} from "../channelService.js";
import {
    addNewChannel,
    getAllChannels,
    updateContainListChannel,
    updateReplaceListChannel
} from "../../models/chanelList.js";
import {command_manageChannel} from "../../controllers/botController.js";
import {getTelegramBot} from "../../models/connection.js";
import {btn_ChannelList} from "./buttons.js";
import {Api} from "telegram";


export async function addNewChannelByDialog(channelDialog, userId) {
    let type = channelDialog.className === 'Chat' ? 'گروه' : (channelDialog.className === 'Channel' ? 'کانال' : channelDialog.className);
    type += ' '
    type += channelDialog.type === 'private' ? 'خصوصی' : (channelDialog.type === 'public' ? 'عمومی' : channelDialog.type);
    channelDialog.type = type;

    addNewChannel(channelDialog, (error, newRecord) => {
        let msg = '';
        if (error) {
            if (error?.errorType === 'uniqueViolated')
                msg = "این کانال از قبل در لیست موجود است: " + channelDialog.username;
            else
                msg = (error?.message || "fail Add channelName");
        } else
            msg = "کانال با موفقیت اضافه شد: "
        command_manageChannel(userId, msg + "\n" + channelToString(newRecord))
    })
}

export async function sendChannelEditList(userId) {
    const bot = await getTelegramBot();
    getAllChannels((error, list) => {
        if (error) {
            bot.sendMessage(userId, {
                message: 'خطا در خواندن لیست کانال' + "\n\n" + error?.message
            });
        } else {
            let messageData = {};
            if (list.length > 0)
                messageData = {
                    peer: userId,
                    message: 'انتخاب کانال',
                    replyMarkup: btn_ChannelList(list),
                };
            else
                messageData = {
                    peer: userId,
                    message: 'لیست کانال ها خالی می باشد.',
                };

            bot.invoke(
                new Api.messages.SendMessage(messageData)
            );
        }
    })
}

export async function removeWordFromChannel(chanel, wordId) {
    const updatedList = chanel.containList.filter(item => item.id !== wordId);
    return await updateContainListChannel(chanel.channelName, updatedList);
}

export async function removeReplaceFromChannel(chanel, replaceId) {
    const updatedList = chanel.replaceList.filter(item => item.id !== replaceId);
    return await updateReplaceListChannel(chanel.channelName, updatedList);
}