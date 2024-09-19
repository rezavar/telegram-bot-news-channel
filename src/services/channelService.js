import {Api} from "telegram";
import {getTelegramClient} from "../models/connection.js";

export async function getChannelInfo(channelName) {
    const client = await getTelegramClient();
    let channel = await client.invoke(new Api.channels.GetChannels({
        id: [await client.getInputEntity(channelName)],
    }));
    try {
        return {
            channelName: channelName,
            title: channel.chats[0].title
        }
    } catch (e) {
        return {};
    }
}

export function channelToString(channel, showContainList = false, showReplaceList = false) {
    if (typeof channel !== 'object')
        return '';
    let str = "مشخصات کانال :" + "\n";
    str += channel?.type + " (" + channel._id + ")\n"
    str += "نام کانال: " + (channel?.channelName || '') + "\n"
    str += "عنوان کانال: " + (channel?.title || '') + "\n"
    str += "وضعیت خواندن پیام: " + (channel?.active ? 'فعال' : 'غیر فعال') + "\n"
    str += "تعداد کلمات کلیدی: " + (channel?.containList?.length || 0) + "\n"
    str += "تعداد کلمات جایگزینی: " + (channel?.replaceList?.length || 0) + "\n"
    if (showContainList) {
        str += "\n" + "لیست کلمات کلیدی :" + "\n";
        channel.containList.forEach(w => {
            str += (w.id + ": " + w.text + "\n")
        })
    }
    if (showReplaceList) {
        str += "\n" + "لیست کلمات جایگزینی :" + "\n";
        channel.replaceList.forEach(r => {
            // if (r.replace !== null) {
            str += '----------------------------------' + "\n"
            str += (r.id + ": " + r.text + "\n=>: " + r.replace)
            str += "\n"
            // }
        })
    }
    return str;
}