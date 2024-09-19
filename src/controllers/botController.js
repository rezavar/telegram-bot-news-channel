import {getTelegramBot} from "../models/connection.js";
import {Api} from "telegram";
import {Raw} from "telegram/events/Raw.js";
import {CallbackQuery} from "telegram/events/CallbackQuery.js";
import {botHandlers} from "../services/bot/handler.js";
import {sleep} from "telegram/Helpers.js";
import {
    btn_containListChannel,
    btn_forceInputChannel, btn_forceInputContainWord,
    btn_manageAdmin,
    btn_manageChannel, btn_replaceListChannel, btn_replaceListDeleteChannel, btn_selectedChannel, btn_selectNewChannel,
    btn_start,
    btn_wordListDeleteChannel, txt_replayMessage
} from "../services/bot/buttons.js";
import {fetchNewAdmin, getAdminList, sendAdminDeleteList, sendOwnerEditList} from "../services/bot/admin.js";
import {editOwner, removeById} from "../models/adminList.js";
import {
    addNewChannelByDialog,
    removeReplaceFromChannel,
    removeWordFromChannel,
    sendChannelEditList
} from "../services/bot/channel.js";
import {
    addNewContainWordChannel, addNewFindTextChannel,
    findChannelById,
    findChannelByName, updateReplaceValue,
    updateStatusChannel
} from "../models/chanelList.js";
import {channelToString} from "../services/channelService.js";
import {convertArabicCharacterToFa} from "../utils/helpers.js";
import {getChannelInfoById, getChannelInfoByTitle} from "../services/clientService.js";
import {botGroupHandlers} from "../services/bot/groupHandler.js";


export async function setupHandlersBot() {

    const bot = await getTelegramBot();
    bot.removeEventHandler(botHandlers);
    bot.removeEventHandler(botGroupHandlers);
    await sleep(100);
    bot.addEventHandler(botHandlers, new Raw({}));
    bot.addEventHandler(botGroupHandlers, new CallbackQuery({}));
}

export async function command_start(userId, msg = 'لطفا بخش مورد نظر را انتخاب کنید.') {
    const bot = await getTelegramBot();
    await bot.sendMessage(userId, {
        message: "Welcome to the bot! " + userId
    });
    const markUp = btn_start();
    const messageData = {
        peer: userId,
        message: msg,
        replyMarkup: markUp,
    };
    await bot.invoke(
        new Api.messages.SendMessage(messageData)
    );
}

export async function command_manageAdmin(userId) {
    const bot = await getTelegramBot();
    const markUp = btn_manageAdmin();
    const messageData = {
        peer: userId,
        message: "مدیریت ادمین.",
        replyMarkup: markUp,
    };
    await bot.invoke(
        new Api.messages.SendMessage(messageData)
    );
}

export async function command_adminAdd(admins, userId) {
    if (!admins) {
        console.log('admins not exist')
        return;
    }
    console.log(admins)
    if (!Array.isArray(admins)) {
        console.log('admins must be array')
        return;
    }
    const adminsIds = admins.map(peer => Number(peer.userId.value));
    fetchNewAdmin(adminsIds, userId)
}

export async function command_adminList(userId) {
    const admins = await getAdminList();
    const bot = await getTelegramBot();
    await bot.sendMessage(userId, {
        message: admins
    });
}

export async function command_adminDelList(userId) {
    const delMessageIds = await sendAdminDeleteList(userId);
    await sleep(10000);
    const bot = await getTelegramBot();
    await bot.deleteMessages(userId, delMessageIds, {revoke: true})
}

export async function command_delUser(userId, delUserId) {
    const bot = await getTelegramBot();
    if (userId === delUserId) {
        await bot.sendMessage(userId, {
            message: "شما نمیتوانید خودتان را حذف کنید "
        });
    } else {
        removeById(delUserId, (error, newRecord) => {
            if (error) {
                console.error(error);
                bot.sendMessage(userId, {
                    message: error?.message || error.toString()
                });
            } else {
                bot.sendMessage(userId, {
                    message: "حذف با موفقیت انجام شد"
                });
            }
        })
    }
}

export async function command_ownerEditList(userId) {
    const bot = await getTelegramBot();
    await bot.sendMessage(userId, {
        message: "جهت افزدون کاربر به لیست مالک + و جهت حذف از لیست مالک - را بزنید."
    });
    const delMessageIds = await sendOwnerEditList(userId);
    await sleep(10000);

    await bot.deleteMessages(userId, delMessageIds, {revoke: true})
}

export async function command_editOwner(userId, editUserId, isOwner) {
    const bot = await getTelegramBot();
    if (userId === editUserId) {
        await bot.sendMessage(userId, {
            message: "شما نمیتوانید خودتان را ویرایش کنید "
        });
    } else {
        editOwner(editUserId, isOwner, (err, numAffected) => {
            if (err) {
                console.error(err);
                bot.sendMessage(userId, {
                    message: err?.message || err.toString()
                });
            } else {
                bot.sendMessage(userId, {
                    message: "ویرایش با موفقیت انجام شد"
                });
            }
        });
    }
}

export async function command_manageChannel(userId, msg = "مدیریت کانال.") {
    const bot = await getTelegramBot();
    const markUp = btn_manageChannel();
    const messageData = {
        peer: userId,
        message: msg,
        replyMarkup: markUp,
    };
    await bot.invoke(
        new Api.messages.SendMessage(messageData)
    );
}

export async function command_forceInputChannelTitle(userId) {
    const bot = await getTelegramBot();
    const markUp = btn_forceInputChannel();
    const messageData = {
        peer: userId,
        message: txt_replayMessage.addChannel + "\n" + "قسمتی از عنوان کانال یا گروه را وارد کنید.:" + "\n" + "توجه داشته باشید شماره اصلی باید عضو این گروه یا کانال باشد." + "\n",
        replyMarkup: markUp,
    };
    const res = await bot.invoke(
        new Api.messages.SendMessage(messageData)
    );
}

export async function command_addChannel(channelTitle, userId) {
    if (!channelTitle || typeof channelTitle !== 'string') {
        console.log('channelName not valid')
        return command_manageChannel(userId, '');
    }
    const channels = await getChannelInfoByTitle(channelTitle.trim());
    if (!channels) {
        return command_manageChannel(userId, 'عبارت وارد شده در عنوان کانال یا گروه پیدا نشد.');
    }

    const bot = await getTelegramBot();
    const btns = btn_selectNewChannel(channels);
    const markup = bot.buildReplyMarkup(btns);
    await bot.sendMessage(userId, {
        message: "با توجه به عنوان ها کانال مورد نظر خود را انتخاب کنید.",
        buttons: markup,
    });
}

export async function command_addNewChannel(userId, channelId) {
    if (!channelId) {
        console.log('ChannelId not valid')
        return command_manageChannel(userId, '');
    }
    const channelDialog = await getChannelInfoById(channelId);
    if (!channelDialog) {
        return command_manageChannel(userId, 'خطا پیدا کردن کانال.');
    }
    addNewChannelByDialog(channelDialog, userId)
}

export async function command_channelList(userId) {
    await sendChannelEditList(userId);
}

export async function command_selectChannel(userId, channelId, msgId, showContainList = false, showReplaceList = false) {
    channelId = Number(channelId)
    const channel = await findChannelById(channelId);
    if (!channel)
        return;
    const bot = await getTelegramBot();
    let markUp = null;
    if (showContainList) {
        markUp = btn_containListChannel(channelId, channel.containList);
    } else if (showReplaceList) {
        markUp = btn_replaceListChannel(channelId, channel.replaceList);
    } else {
        markUp = btn_selectedChannel(channelId, channel.active);
    }

    await bot.invoke(
        new Api.messages.EditMessage({
            peer: userId,
            id: msgId,
            message: channelToString(channel, showContainList, showReplaceList),
            replyMarkup: markUp
        })
    );
}


export async function command_editActiveChannel(userId, channelId, msgId, active) {
    await updateStatusChannel(channelId, active);
    return command_selectChannel(userId, channelId, msgId);
}

export async function command_wordListDeleteChannel(userId, channelId, msgId) {
    const channel = await findChannelById(channelId);
    if (!channel)
        return;
    if (!channel.containList)
        return;
    const bot = await getTelegramBot();
    let markUp = btn_wordListDeleteChannel(channelId, channel.containList);

    await bot.invoke(
        new Api.messages.EditMessage({
            peer: userId,
            id: msgId,
            message: channelToString(channel, true),
            replyMarkup: markUp
        })
    );
}


export async function command_wordDeleteChannel(msgId, userId, channelId, wordId) {
    const channel = await findChannelById(channelId);
    if (!channel)
        return;
    if (!channel.containList)
        return;
    await removeWordFromChannel(channel, wordId);
    return command_selectChannel(userId, channelId, msgId, true);
}

export async function command_forceInputContainWord(userId, channelId, msgId) {
    const channel = await findChannelById(channelId);
    if (!channel)
        return;
    const bot = await getTelegramBot();
    const markUp = btn_forceInputContainWord();//btn_forceInputChannel()
    await bot.deleteMessages(userId, [msgId], {revoke: true})
    const messageData = {
        peer: userId,
        message: txt_replayMessage.addContainWord + channel.channelName + "\n" + channelToString(channel, true),
        replyMarkup: markUp,
    };
    await bot.invoke(
        new Api.messages.SendMessage(messageData)
    );
}

export async function command_addContainWord(msgIds, userId, word, channelName) {
    const channel = await findChannelByName(channelName);
    if (!channel)
        return command_manageChannel(userId, 'کانال  پیدا نشد.');
    if (!word || typeof word !== 'string')
        return command_manageChannel(userId, 'کلمه بدرستی وارد نشده است.');
    word = convertArabicCharacterToFa(word.trim())
    const bot = await getTelegramBot();

    const messageData = {
        peer: userId,
        message: 'کلمه ' + word + ' با موفقیت اضافه شد.',
        replyMarkup: btn_manageChannel(),
    };
    await bot.invoke(
        new Api.messages.SendMessage(messageData)
    );
    await bot.deleteMessages(userId, msgIds, {revoke: true})
    await addNewContainWordChannel(channelName, word, (error, rowAdd) => {
    })
    const res = await bot.sendMessage(userId, {
        message: channelToString(channel, true, false)
    });
    // await sleep(100);
    return command_selectChannel(userId, channel._id, res.id, true);
}

export async function command_replaceListDeleteChannel(userId, channelId, msgId) {
    const channel = await findChannelById(channelId);
    if (!channel)
        return;
    if (!channel.replaceList)
        return;
    const bot = await getTelegramBot();
    let markUp = btn_replaceListDeleteChannel(channelId, channel.replaceList);

    await bot.invoke(
        new Api.messages.EditMessage({
            peer: userId,
            id: msgId,
            message: channelToString(channel, false, true),
            replyMarkup: markUp
        })
    );
}

export async function command_replaceDeleteChannel(msgId, userId, channelId, replaceId) {
    const channel = await findChannelById(channelId);
    if (!channel)
        return;
    if (!channel.replaceList)
        return;
    await removeReplaceFromChannel(channel, replaceId);
    return command_selectChannel(userId, channelId, msgId, false, true);
}

export async function command_forceInputReplaceText(userId, channelId, msgId, msgPrefix, postFix = '') {
    const channel = await findChannelById(channelId);
    if (!channel)
        return;
    const bot = await getTelegramBot();
    const markUp = btn_forceInputContainWord();//btn_forceInputChannel()
    if (!Array.isArray(msgId))
        msgId = [msgId]
    await bot.deleteMessages(userId, msgId, {revoke: true})
    const messageData = {
        peer: userId,
        message: msgPrefix + channel.channelName + postFix + "\n" + channelToString(channel, false, true),
        replyMarkup: markUp,
    };
    await bot.invoke(
        new Api.messages.SendMessage(messageData)
    );
}

export async function command_addFindText(msgIds, userId, findText, channelName) {
    const channel = await findChannelByName(channelName);
    if (!channel)
        return command_manageChannel(userId, 'کانال  پیدا نشد.');
    if (!findText || typeof findText !== 'string')
        return command_manageChannel(userId, 'متن بدرستی وارد نشده است.');
    findText = convertArabicCharacterToFa(findText.trim())
    const bot = await getTelegramBot();

    await addNewFindTextChannel(channelName, findText, async (error, findTextId) => {
        if (error) {
            await bot.deleteMessages(userId, msgIds, {revoke: true})
            console.log(error)
            return command_manageChannel(userId, error.toString());
        } else {
            return command_forceInputReplaceText(userId, channel._id, msgIds, txt_replayMessage.addReplaceText, "@" + findTextId)
        }

    })
}

export async function command_addReplaceText(msgIds, userId, replaceText, channelName, findTextId) {
    const channel = await findChannelByName(channelName);
    if (!channel)
        return command_manageChannel(userId, 'کانال  پیدا نشد.');
    if (!replaceText || typeof replaceText !== 'string')
        return command_manageChannel(userId, 'متن جایگزین بدرستی وارد نشده است.');
    replaceText = convertArabicCharacterToFa(replaceText.trim())
    const bot = await getTelegramBot();

    const messageData = {
        peer: userId,
        message: 'عبارت ' + replaceText + ' با موفقیت اضافه شد.',
        replyMarkup: btn_manageChannel(),
    };
    await bot.invoke(
        new Api.messages.SendMessage(messageData)
    );

    await bot.deleteMessages(userId, msgIds, {revoke: true})
    const replace = await updateReplaceValue(channel._id, findTextId, replaceText)
    if (!replace) {
        return command_manageChannel(userId, 'بروز رسانی موفق نبود');
    } else {

        const res = await bot.sendMessage(userId, {
            message: channelToString(channel, false, true)
        });
        // await sleep(100);
        return command_selectChannel(userId, channel._id, res.id, false, true);
    }

}