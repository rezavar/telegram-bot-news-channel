import {getTelegramBot, getTelegramClient} from "../../models/connection.js";
import {Api} from "telegram";
import {getUserInfo, userToString} from "../userService.js";
import {addAdmin, getAllAdmins} from "../../models/adminList.js";
import {btn_delUser, btn_editUser} from "./buttons.js";

export async function fetchNewAdmin(adminsIds, userId) {

    const bot = await getTelegramBot();
    try {
        const admins = await getUserInfo(adminsIds)

        for (const admin of admins) {
            let phone = admin.phone;
            if (phone.startsWith('98'))
                phone = phone.replace('98', '0')
            else if (phone.startsWith('+98'))
                phone = phone.replace('+98', '0')

            addAdmin(admin.userId, admin.userName, phone, (error, newRecord) => {
                let msg = '';
                if (error) {
                    if (error?.errorType === 'uniqueViolated')
                        msg = "unique adminId : ";
                    else
                        msg = (error?.message || "fail Add Admin");
                } else
                    msg = "admin added successfully: "

                bot.sendMessage(userId, {
                    message: msg + "\n" + userToString(admin)
                });
            })
        }
    } catch (e) {
        let msg = e.message;
        if (msg.toLowerCase().includes('could not find the input entity'))
            msg = "ادمین باید در لیست مخاطبین شماره لاگین کرده باشد.";

        await bot.sendMessage(userId, {
            message: 'خطا در اضافه کردن ادمین' + "\n\n" + msg
        });
    }
}


export async function getAdminList() {
    const allAdmin = await getAllAdmins();
    let list = "لیست کل ادمین ها :" + "\n\n";
    for (let a of allAdmin)
        list += userToString(a) + "\n\n" + "-----------" + "\n"
    return list;
}

export async function sendAdminDeleteList(userId) {
    const allAdmin = await getAllAdmins();
    const bot = await getTelegramBot();
    let list = [];
    for (let a of allAdmin) {
        if (!a?.userId || a?.isMaster)
            continue;
        const messageData = {
            peer: userId,
            message: userToString(a),
            replyMarkup: btn_delUser(a?.userId),
        };
        let res = await bot.invoke(
            new Api.messages.SendMessage(messageData)
        );
        list.push(res.id)
    }
    return list;
}


export async function sendOwnerEditList(userId) {
    const allUser = await getAllAdmins();
    const bot = await getTelegramBot();
    let list = [];
    for (let a of allUser) {
        if (!a?.userId || a?.isMaster)
            continue;
        const messageData = {
            peer: userId,
            message: userToString(a),
            replyMarkup: btn_editUser(a.userId),
        };
        let res = await bot.invoke(
            new Api.messages.SendMessage(messageData)
        );
        list.push(res.id)
    }
    return list;
}
