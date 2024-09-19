import {getTelegramBot, getTelegramClient} from "../models/connection.js";
import {Api} from "telegram";
import {
    getDefaultChannel,
    getDefaultGroup,
    setDefaultChannel,
    setDefaultGroup,
    setDefaultUser
} from "../models/config.js";
import input from "input";
import {getChatInfoByTitle} from "../services/clientService.js";
import {clientHandlers} from "../services/clientService.js";
import {getActiveChannelIds} from "../models/chanelList.js";
import {NewMessage} from "telegram/events/index.js";
import {sleep} from "telegram/Helpers.js";
import {getExtension, getFileInfo} from "telegram/Utils.js";
import {writeFileSync, unlinkSync} from "fs";
import {btn_publishNews} from "../services/bot/buttons.js";
import path from 'path'

// const detectText = "\n-*$!/^+-"

export async function saveMe(client, phone = '') {

    const me = await client.getEntity('me');

    phone = me.phone || phone;
    if (phone.startsWith('+98'))
        phone = phone.replace('+98', '0')
    else if (phone.startsWith('98'))
        phone = phone.replace('98', '0')

    const defaultUser = {
        userId: Number(me.id.value),
        userName: me.username,
        phone: phone,
        isAdmin: true,
        isOwner: true,
        isMaster: true
    }
    await setDefaultUser(defaultUser)
}

export async function saveDefaultGroup(client) {
    const defaultGroup = await getDefaultGroup()

    if (defaultGroup?.title && defaultGroup?.id) {
        try {
            await client.sendMessage(defaultGroup?.id, {
                message: "start client and check group"
            });
            return;
        } catch (e) {
        }
    }

    const getTitle = async () => {
        return await input.text('enter title news group: ');
    };
    const getCommand = async () => {
        const command = await input.text('please type(yes/no): ');
        return command.trim().toLowerCase();
    };

    do {
        const title = await getTitle();
        const groups = await getChatInfoByTitle(title)
        if (groups.length === 0) {
            console.log('Can not find Group', 'do you want create group with title(yes/no):' + title)
            const command = await getCommand()
            if (command === 'yes' || command === 'y') {
                const me = await client.getEntity('me');
                const result = await client.invoke(
                    new Api.messages.CreateChat({
                        users: [me],
                        title: title,
                    })
                );
                const id = Number(result.updates.chats[0].id.value) * -1;
                console.log("create group " + title + " id:" + id)
                await client.sendMessage(id, {
                    message: ' ایجاد گروه' + id
                });
                await setDefaultGroup({
                    id: id,
                    title: title,
                })
                return;
            }
        }
        if (groups.length > 1)
            console.log('There are more than one groups with the input title', 'Please change the group title to a unique and then re-enter the title')
        else {
            const group = groups[0]
            await setDefaultGroup({
                id: group.id,
                title: group.title,
            })
            await client.sendMessage(id, {
                message: "start client and check group"
            });
            return;
        }
    } while (true);
}

export async function saveDefaultChannel(client) {


    const defaultChannel = await getDefaultChannel()
    if (defaultChannel?.name && defaultChannel?.id) {
        try {
            const result = await client.invoke(
                new Api.channels.GetChannels({
                    id: [defaultChannel?.name], // نام یا آیدی کانال
                })
            );
            const chats = result.chats;
            const chat = chats[0];
            if (chat.creator)
                return;
        } catch (e) {
        }
    }

    const getName = async () => {
        let name = null
        do {
            console.log('channel link format: https://t.me/ChannelName')
            name = await input.text('enter news channel link: ');
            if (name.includes('https://t.me/'))
                break;
        } while (1);
        return name.trim().replaceAll('https://t.me/', '');
    };


    do {
        const name = await getName();

        try {
            const result = await client.invoke(
                new Api.channels.GetChannels({
                    id: [name],
                })
            );
            const chats = result.chats;
            const chat = chats[0];
            if (chat.creator) {
                await setDefaultChannel({
                    id: Number(chat.id.value) * -1,
                    name: name,
                })
                return;
            } else
                console.log('شماره پیش فرض مالک این کانال نمی باشد')
        } catch (e) {
            console.log(' خطا در ذخیره مقدار کانال پیش فرض', e?.message)
        }

        console.log('خطا در پیدا کردن کانال و ذخیره آن')
    } while (true);


}

export async function setupHandlersClient() {

    const client = await getTelegramClient();
    client.removeEventHandler(clientHandlers);
    await sleep(100);
    const channelIds = await getActiveChannelIds();
    const defaultGroup = await getDefaultGroup()
    let ids = [defaultGroup.id, ...channelIds]
    ids = ids.map(id => {
        if (typeof id === "number" && id < 0) {
            id += '';
            id = id.replaceAll('-', '-100')
            return Number(id)
        }
        return id
    })

    try {
        client.addEventHandler(clientHandlers, new NewMessage({chats: ids}));
    } catch (e) {
        console.log(e);
    }
}

export async function sendToGroup(newText, media = null) {
    let fullFilePath = '';
    let message = {}
    // newText = newText + detectText
    if (media) {
        fullFilePath = await _getFilePath(media)
        console.log(fullFilePath)
        if (fullFilePath) {
            message = {
                file: fullFilePath,
                message: newText,
            }
        } else
            return;
    } else {
        message = {
            message: newText,
        }
    }

    try {
        await _sendMessageToGroup(message)
    } catch (error) {
        console.error('Error sending message:', error);
    } finally {
        if (fullFilePath)
            await unlinkSync(fullFilePath);
    }

}

async function _getFilePath(media, MAX_File_SIZE = 5 * 1024 * 1024) {
    const client = await getTelegramClient()
    const info = getFileInfo(media)
    const size = info.size.valueOf();
    if (size > MAX_File_SIZE) {
        console.log('max size file ' + size)
        return null;
    }
    let tmpName = info.dcId.toString(36).substring(2) + "_" + Math.random().toString(36).substring(2)
    tmpName = tmpName.trim()
    const fullFilePath = path.resolve('./src/tmp/' + tmpName + "." + getExtension(media));
    const file = await client.downloadMedia(media);
    try {
        await writeFileSync(fullFilePath, file);
        return fullFilePath;
    } catch (error) {
        console.error('Error saving file:', error);
        return null;
    }
}

async function _sendMessageToGroup(message) {
    const bot = await getTelegramBot()
    const defaultGroup = await getDefaultGroup();
    const btn = btn_publishNews();

    message.buttons = bot.buildReplyMarkup(btn);
    await bot.sendMessage(defaultGroup.id, message);
}


export async function publishNews(userName, messageId, oldMessage) {
    const postfix = "\n" + "تایید شده:" + userName
    _editMessage(postfix, messageId, oldMessage)
    const client = await getTelegramClient()

    let fullFilePath = '';
    let newText = oldMessage.message//.replaceAll(detectText, '')
    let message = {};
    const defaultChanel = await getDefaultChannel()

    if (oldMessage?.media) {
        fullFilePath = await _getFilePath(oldMessage?.media)
        if (fullFilePath) {
            message = {
                file: fullFilePath,
                message: newText,
            }
        } else
            return;
    } else {
        message = {
            message: newText,
        }
    }

    try {
        await client.sendMessage(defaultChanel.id, message);
    } catch (error) {
        console.error('Error sending message:', error);
    } finally {
        if (fullFilePath)
            await unlinkSync(fullFilePath);
    }

}

export async function rejectNews(userName, messageId, message) {
    const postfix = "\n" + "حذف شده:" + userName
    _editMessage(postfix, messageId, message)
}

export async function _editMessage(postfix, messageId, message) {
    // const newText = message.message.replaceAll(detectText, postfix)
    const newText = message.message + postfix
    const defaultGroup = await getDefaultGroup()
    const bot = await getTelegramBot()
    let config = {
        peer: Number(defaultGroup.id),
        id: messageId,
        replyMarkup: null,
        message: newText
    };
    console.log(config)
    await bot.invoke(
        new Api.messages.EditMessage(config)
    );
}


