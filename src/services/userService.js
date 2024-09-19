import {getTelegramClient} from "../models/connection.js";
import {Api} from "telegram";

export async function getUserInfo(userIds) {

    const client = await getTelegramClient();
    const users = await client.invoke(new Api.users.GetUsers({
        id: userIds,
    }));

    return users.map(user => ({
        userId: Number(user?.id?.value || 0),
        userName: (user?.username || (user?.firstName || '') + ' ' + (user?.lastName || '')).trim(),
        phone: user?.phone || '',
    }));
}

export function userToString(user) {
    if (typeof user !== 'object')
        return;
    let str = '';
    if (user?.phone)
        str += "شماره موبایل: " + user?.phone + "\n"
    if (user?.userName)
        str += "نام کاربری: " + user?.userName + "\n"
    if (user?.userId)
        str += "شناسه کاربری: " + user?.userId + "\n"
    if (user?.isOwner)
        str += "نوع کاربر: مالک" + "\n"
    else if (user?.isAdmin)
        str += "نوع کاربر: ادمین" + "\n"
    return str;
}