import {getTelegramClient} from "../models/connection.js";
import {findChannelById} from "../models/chanelList.js";
import {sendToGroup, setupHandlersClient} from "../controllers/clientController.js";


export async function clientHandlers(event) {
    const message = event.message;
    if (!message) {
        return;
    }
    let newMsg = (message?.message || '').trim().toLowerCase()
    if (!newMsg) {
        return;
    }
    if (message?.replyMarkup) {
        return;
    }
    const chat = await message.getChat();
    if (!chat) {
        return;
    }
    // const sender = await message.getSender();
    // if (sender.bot)
    //     return;

    // const receiverId = Math.abs(Number(chat.id))
    // const ids
    const channel = await findChannelById(Math.abs(Number(chat.id)) * -1)
    if (!channel) {
        return;
    }
    if (channel.active === false) {
        setupHandlersClient()
        return;
    }
    if (channel.containList.length > 0) {
        if (!channel.containList.some(item => newMsg.includes(item.text)))
            return;
    }
    if (channel.replaceList.length > 0) {
        channel.replaceList.forEach(item => {
            if (item.replace !== null)
                newMsg = newMsg.replaceAll(item.text, item.replace);
        })
    }
    sendToGroup(newMsg, message?.media)

}

export async function getChannelInfoByTitle(title) {
    if (!title)
        return [];
    let dialogs = await getDialogList();
    return dialogs.filter(dialog =>
        dialog.className !== 'User' &&
        dialog.title &&
        dialog.title.toLowerCase().includes(title.toLowerCase())
    );
}

export async function getChatInfoByTitle(title) {
    if (!title)
        return [];
    let dialogs = await getDialogList();
    return dialogs.filter(dialog =>
        dialog.className === 'Chat' &&
        dialog.title &&
        dialog.title.toLowerCase().includes(title.toLowerCase())
    );
}

export async function getChannelInfoById(channelId) {
    if (!channelId)
        return {};
    let dialogs = await getDialogList();
    dialogs = dialogs.filter(dialog =>
        dialog.className !== 'User' &&
        dialog.id === channelId
    );
    if (dialogs.length > 0)
        return dialogs[0]
    return {}
}

export async function getDialogList() {

    const client = await getTelegramClient();
    let dialogs = await client.getDialogs();
    let list = [];
    dialogs.forEach(dialog => {
        if (dialog?.entity?.id?.value)
            list.push({
                className: dialog?.entity?.className,
                id: dialog?.entity?.className === 'User' ? Number(dialog?.entity?.id?.value) : Number(dialog?.entity?.id?.value) * -1,
                username: dialog?.entity?.username,
                type: dialog?.entity?.username ? 'public' : 'private',
                title: dialog?.entity?.title,
                // phone: dialog?.entity?.phone,
                // accessHash: dialog?.entity?.accessHash,
                // firstName: dialog?.entity?.firstName,
                // lastName: dialog?.entity?.lastName,
            })
    })
    return list;
}