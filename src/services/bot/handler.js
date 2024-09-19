import {Api} from "telegram";
import {getOwnerIds} from "../../models/adminList.js";
import {getTelegramBot} from "../../models/connection.js";
import {
    command_addChannel,
    command_addContainWord,
    command_addFindText, command_addNewChannel,
    command_addReplaceText,
    command_adminAdd,
    command_adminDelList,
    command_adminList,
    command_channelList,
    command_delUser,
    command_editActiveChannel,
    command_editOwner,
    command_forceInputChannelTitle,
    command_forceInputContainWord,
    command_forceInputReplaceText,
    command_manageAdmin,
    command_manageChannel,
    command_ownerEditList,
    command_replaceDeleteChannel,
    command_replaceListDeleteChannel,
    command_selectChannel,
    command_start,
    command_wordDeleteChannel,
    command_wordListDeleteChannel
} from "../../controllers/botController.js";
import {btn_callBackData, btn_ids, btn_txt, txt_replayMessage} from "./buttons.js";


export async function botHandlers(event) {

    if (!event) {
        return;
    }

    const checkMessage = () => {
        return (event?.className === 'Message' || event.className === 'UpdateBotCallbackQuery')
    }

    const message = checkMessage() ? event : event?.message;
    if (!message) {
        return;
    }

    const userId = Number(message?.from?.id || message?.peer?.userId?.value || message?.peerId?.userId?.value || message?.chat?.id || 0);
    if (!userId) {
        console.log('!userId')
        return;
    }


    const ownerIds = await getOwnerIds();

    if (!ownerIds.includes(userId)) {

        await _notAllowUser(userId);

    } else {
        if (event instanceof Api.UpdateNewMessage) {

            if (message.className === 'Message') {
                _message(message, userId)
            } else if (message.className === 'MessageService') {
                _service(message, userId)
            }
        } else if (event instanceof Api.UpdateBotCallbackQuery) {
            // bot.editMessage(userId, {message: event.msgId, text: "Hello!"})
            _callbackQuery(message, userId, event.msgId)
        }
    }
}

async function _notAllowUser(chatId) {
    const bot = await getTelegramBot();
    await bot.sendMessage(chatId, {
        message: "شما مجاز به استافده از ربات نیستید " + chatId
    });
}

function _message(message, userId) {
    if (!message?.message) {
        console.log('error !message?.text')
        return;
    }
    if (message?.replyTo?.replyToMsgId) {
        _replayMessage(message, userId)
    } else if (message.message.startsWith('/'))
        _command(message.message, userId)
    else
        _keyboard(message.message, userId)

}

async function _replayMessage(message, userId) {

    const bot = await getTelegramBot();
    let originalMessages = await bot.invoke(new Api.messages.GetMessages({
        id: [message.replyTo?.replyToMsgId],
    }));
    let originCommand = '';
    for (let a of originalMessages?.messages || []) {
        const {peerId} = a;
        if (userId === Number(peerId.userId.value)) {
            originCommand = a.message;
            originalMessages = null;
            break;
        }
    }

    if (originCommand.includes(txt_replayMessage.addChannel)) {

        const channelTitle = message?.message;
        command_addChannel(channelTitle, userId)

    } else if (originCommand.includes(txt_replayMessage.addContainWord)) {

        const word = message?.message;
        originCommand = originCommand.replaceAll(txt_replayMessage.addContainWord, '').split('\n')
        const channelName = originCommand[0]?.trim() || ''
        command_addContainWord([message.id, message.replyTo?.replyToMsgId], userId, word, channelName)

    } else if (originCommand.includes(txt_replayMessage.addFindText)) {

        const text = message?.message;
        originCommand = originCommand.replaceAll(txt_replayMessage.addFindText, '').split('\n')
        const channelName = originCommand[0]?.trim() || ''
        command_addFindText([message.id, message.replyTo?.replyToMsgId], userId, text, channelName)

    } else if (originCommand.includes(txt_replayMessage.addReplaceText)) {

        const text = message?.message;
        originCommand = originCommand.replaceAll(txt_replayMessage.addReplaceText, '').split('\n')
        originCommand = originCommand[0]?.trim() || ''
        let [channelName, findTextId] = originCommand.split('@')
        channelName = channelName.trim()
        findTextId = Number(findTextId.trim())
        command_addReplaceText([message.id, message.replyTo?.replyToMsgId], userId, text, channelName, findTextId)

    } else
        command_start(userId)
}

function _command(command, userId) {

    if (command === '/start') {
        command_start(userId)
    } else if (command === '/owner') {
        command_ownerEditList(userId)
    }
}

function _keyboard(text, userId) {
    text = text.trim();
    if (text === btn_txt.manageAdmin) {
        command_manageAdmin(userId)
    } else if (text === btn_txt.manageChannel) {
        command_manageChannel(userId)
    } else if (text === btn_txt.back) {
        command_start(userId)
    } else if (text === btn_txt.adminList) {
        command_adminList(userId)
    } else if (text === btn_txt.adminDel) {
        command_adminDelList(userId)
    } else if (text === btn_txt.channelAdd) {
        command_forceInputChannelTitle(userId)
    } else if (text === btn_txt.channelList) {
        command_channelList(userId)
    } else {
        command_start(userId)
    }
    // else if (text === btn_txt.channelDel) {
    //     command_channelDel(userId)
    // } else if (text === btn_txt.channelList) {
    //     command_channelList(userId)
    // }
}

function _service(message, userId) {
    const actionId = message?.action?.buttonId
    if (actionId === btn_ids.shareUsers)
        command_adminAdd(message?.action?.peers, userId)

}

function _callbackQuery(message, userId, msgId) {
    let [command, data1, data2] = message.data.toString('utf-8').trim().split('_')
    data1 = typeof data1 === 'string' ? data1.trim() : data1
    data2 = typeof data2 === 'string' ? data2.trim() : data2
    if (!data1 && !data2)
        return;

    const delReplayMarkup = async () => {
        if (!msgId)
            return;
        const bot = await getTelegramBot();
        await bot.invoke(
            new Api.messages.EditMessage({
                peer: userId,
                id: msgId,
                replyMarkup: null
            })
        );
    }

    switch (command) {
        case btn_callBackData.manageNewsAccept:
        case btn_callBackData.manageNewsReject:
            return;

        case btn_callBackData.delAdmin:
            delReplayMarkup().then(() => {
                return command_delUser(userId, Number(data1))
            })
            break;
        case  btn_callBackData.delOwner:
            delReplayMarkup().then(() => {
                return command_editOwner(userId, Number(data1), false)
            })
            break;
        case btn_callBackData.setOwner:
            delReplayMarkup().then(() => {
                return command_editOwner(userId, Number(data1), true)
            })
            break;

        case btn_callBackData.backToKeyboard:
            delReplayMarkup().then(() => {
                return command_manageChannel(userId)
            })
            break;
        case btn_callBackData.selectChannel:
        case btn_callBackData.wordListChannel:
        case btn_callBackData.replaceListChannel:
            return command_selectChannel(
                userId,
                Number(data1),
                msgId,
                command === btn_callBackData.wordListChannel,
                command === btn_callBackData.replaceListChannel
            );
        case btn_callBackData.selectNewChannel:
            delReplayMarkup().then(() => {
                return command_addNewChannel(
                    userId,
                    Number(data1)
                );
            })
            break;

        case btn_callBackData.activeChannel:
        case btn_callBackData.deActiveChannel:
            return command_editActiveChannel(userId, Number(data1), msgId, command === btn_callBackData.activeChannel);


        case btn_callBackData.wordListDeleteChannel:
            return command_wordListDeleteChannel(userId, Number(data1), msgId);

        case btn_callBackData.wordDeleteChannel:
            return command_wordDeleteChannel(msgId, userId, Number(data1), Number(data2));

        case btn_callBackData.wordAddChannel:
            return command_forceInputContainWord(userId, Number(data1), msgId);

        case btn_callBackData.replaceListDeleteChannel:
            return command_replaceListDeleteChannel(userId, Number(data1), msgId);

        case btn_callBackData.replaceDeleteChannel:
            return command_replaceDeleteChannel(msgId, userId, Number(data1), Number(data2));

        case btn_callBackData.replaceAddChannel:
            return command_forceInputReplaceText(userId, Number(data1), msgId, txt_replayMessage.addFindText);

        default:
            console.log('error on command ', {command, data1, data2})
            return command_start(userId, 'عدم شناسایی دستور');
    }

}