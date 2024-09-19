import {Api} from "telegram";
import {Button} from "telegram/tl/custom/button.js";
import {truncateText} from "../../utils/helpers.js";


export const btn_txt = {
    manageAdmin: 'مدیریت مدیر',
    manageOwner: 'مدیریت مالک',
    manageChannel: 'مدیریت کانال',
    back: 'بازگشت',
    adminAdd: 'افزودن ادمین',
    adminDel: 'حذف ادمین',
    adminList: 'لیست ادمین',
    channelAdd: 'افزودن کانال',
    channelList: 'لیست کانال'
}

export const btn_ids = {
    shareUsers: 1001
}

export const btn_callBackData = {
    delAdmin: 'delAdmin',
    setOwner: 'setOwner',
    delOwner: 'delOwner',
    backToKeyboard: 'back',
    selectChannel: 'selectCh',
    selectNewChannel: 'sNCh',
    activeChannel: 'activeCh',
    deActiveChannel: 'deActiveCh',
    wordListChannel: 'wlch',
    wordListDeleteChannel: 'wldch',
    wordDeleteChannel: 'wdch',
    wordAddChannel: 'wach',
    replaceListChannel: 'rlch',
    replaceDeleteChannel: 'rdch',
    replaceAddChannel: 'rAch',
    replaceListDeleteChannel: 'rLDch',
    manageNewsAccept: 'manageNewsAccept',
    manageNewsReject: 'manageNewsReject',
}

export const txt_replayMessage = {
    addChannel: "add channel title",
    addContainWord: "add contain word: ",
    addFindText: "add find text: ",
    addReplaceText: "add replace text: "
}


export function btn_start() {

    return new Api.ReplyKeyboardMarkup({
        resize: true,
        singleUse: true,
        rows: [
            new Api.KeyboardButtonRow({
                buttons: [
                    new Api.KeyboardButton({
                        text: btn_txt.manageAdmin
                    })
                ]
            }),
            new Api.KeyboardButtonRow({
                buttons: [
                    new Api.KeyboardButton({
                        text: btn_txt.manageChannel
                    })
                ]
            })
        ]
    })
}


export function btn_manageAdmin() {

    return new Api.ReplyKeyboardMarkup({
        resize: true,
        singleUse: true,
        rows: [
            new Api.KeyboardButtonRow({
                buttons: [
                    new Api.KeyboardButton({
                        text: btn_txt.adminDel
                    }),
                    new Api.KeyboardButtonRequestPeer({
                        text: btn_txt.adminAdd,
                        peerType: new Api.RequestPeerTypeUser({
                            bot: false,
                            premium: false
                        }),
                        buttonId: btn_ids.shareUsers,
                        maxQuantity: 4
                    }),
                    new Api.KeyboardButton({
                        text: btn_txt.adminList
                    }),
                ]
            }),
            new Api.KeyboardButtonRow({
                buttons: [
                    new Api.KeyboardButton({
                        text: btn_txt.back
                    })
                ]
            })
        ]
    })
}

export function btn_delUser(userId) {
    userId = (userId + '').trim();
    return new Api.ReplyInlineMarkup({
        rows: [
            new Api.KeyboardButtonRow({
                buttons: [
                    new Api.KeyboardButtonCallback({
                        text: 'حذف',
                        data: Buffer.from(btn_callBackData.delAdmin + '_' + userId),
                    })
                ],
            }),
        ],
    });

}

export function btn_editUser(userId) {
    userId = (userId + '').trim();
    return new Api.ReplyInlineMarkup({
        rows: [
            new Api.KeyboardButtonRow({
                buttons: [
                    new Api.KeyboardButtonCallback({
                        text: '-',
                        data: Buffer.from(btn_callBackData.delOwner + '_' + userId),
                    }),
                    new Api.KeyboardButtonCallback({
                        text: '+',
                        data: Buffer.from(btn_callBackData.setOwner + '_' + userId),
                    })
                ],
            }),
        ],
    });

}

export function btn_manageChannel() {

    return new Api.ReplyKeyboardMarkup({
        resize: true,
        singleUse: true,
        rows: [
            new Api.KeyboardButtonRow({
                buttons: [
                    new Api.KeyboardButton({
                        text: btn_txt.channelAdd
                    }),
                    new Api.KeyboardButton({
                        text: btn_txt.channelList
                    }),
                ]
            }),
            new Api.KeyboardButtonRow({
                buttons: [
                    new Api.KeyboardButton({
                        text: btn_txt.back
                    })
                ]
            })
        ]
    })
}

export function btn_forceInputChannel() {
    return new Api.ReplyKeyboardForceReply({
        singleUse: true,
        selective: true
    });
}

export function btn_ChannelList(list) {
    if (!Array.isArray(list))
        return;
    let btn = list.map(ch => {
        return new Api.KeyboardButtonRow({
            buttons: [
                new Api.KeyboardButtonCallback({
                    text: ch.title + " (" + ch.channelName + ")",
                    data: Buffer.from(btn_callBackData.selectChannel + '_' + ch._id),
                }),
            ],
        })
    })
    return new Api.ReplyInlineMarkup({
        rows: btn,
    });
}

export function btn_selectedChannel(channelId, active) {
    let callbackStatusText = active ? 'غیر فعال کردن' : 'فعال کردن';
    let callbackStatusBtn = active ? btn_callBackData.deActiveChannel : btn_callBackData.activeChannel;
    return new Api.ReplyInlineMarkup({
        rows: [
            new Api.KeyboardButtonRow({
                buttons: [
                    new Api.KeyboardButtonCallback({
                        text: callbackStatusText,
                        data: Buffer.from(callbackStatusBtn + '_' + channelId),
                    })
                ],
            }),
            new Api.KeyboardButtonRow({
                buttons: [
                    new Api.KeyboardButtonCallback({
                        text: 'کلمات کلیدی',
                        data: Buffer.from(btn_callBackData.wordListChannel + '_' + channelId),
                    }),
                    new Api.KeyboardButtonCallback({
                        text: 'کلمات جایگزینی',
                        data: Buffer.from(btn_callBackData.replaceListChannel + '_' + channelId),
                    })
                ],
            }),
            new Api.KeyboardButtonRow({
                buttons: [
                    new Api.KeyboardButtonCallback({
                        text: 'برگشت',
                        data: Buffer.from(btn_callBackData.backToKeyboard + '_' + channelId),
                    }),
                ],
            }),
        ],
    });
}

export function btn_selectNewChannel(channels) {
    let btn_list = [];
    channels.forEach(channel => {
        btn_list.push(
            [Button.inline(channel.title, Buffer.from(btn_callBackData.selectNewChannel + '_' + channel.id))]
        )
    })
    return btn_list;
}

export function btn_publishNews() {
    return [
        [
            Button.inline('حذف', Buffer.from(btn_callBackData.manageNewsReject)),
            Button.inline('انتشار', Buffer.from(btn_callBackData.manageNewsAccept))
        ]
    ]
}

export function btn_containListChannel(channelId, containList) {
    let btn = [];

    if (containList.length > 0)
        btn = [
            new Api.KeyboardButtonCallback({
                text: 'افزودن کلمه',
                data: Buffer.from(btn_callBackData.wordAddChannel + '_' + channelId),
            }),
            new Api.KeyboardButtonCallback({
                text: 'حذف کلمه',
                data: Buffer.from(btn_callBackData.wordListDeleteChannel + '_' + channelId),
            })
        ]
    else
        btn = [
            new Api.KeyboardButtonCallback({
                text: 'افزودن کلمه',
                data: Buffer.from(btn_callBackData.wordAddChannel + '_' + channelId),
            })
        ]

    return new Api.ReplyInlineMarkup({
        rows: [
            new Api.KeyboardButtonRow({
                buttons: btn
            }),
            new Api.KeyboardButtonRow({
                buttons: [
                    new Api.KeyboardButtonCallback({
                        text: 'برگشت',
                        data: Buffer.from(btn_callBackData.selectChannel + '_' + channelId),
                    }),
                ],
            }),
        ],
    });
}

export function btn_replaceListChannel(channelId, replaceList) {
    let btn = [];
    if (replaceList.length > 0)
        btn = [
            new Api.KeyboardButtonCallback({
                text: 'افزودن متن جایگزینی',
                data: Buffer.from(btn_callBackData.replaceAddChannel + '_' + channelId),
            }),
            new Api.KeyboardButtonCallback({
                text: 'حذف متن جایگزینی',
                data: Buffer.from(btn_callBackData.replaceListDeleteChannel + '_' + channelId),
            })
        ]
    else
        btn = [
            new Api.KeyboardButtonCallback({
                text: 'افزودن متن جایگزینی',
                data: Buffer.from(btn_callBackData.replaceAddChannel + '_' + channelId),
            })
        ]

    return new Api.ReplyInlineMarkup({
        rows: [
            new Api.KeyboardButtonRow({
                buttons: btn
            }),
            new Api.KeyboardButtonRow({
                buttons: [
                    new Api.KeyboardButtonCallback({
                        text: 'برگشت',
                        data: Buffer.from(btn_callBackData.selectChannel + '_' + channelId),
                    }),
                ],
            }),
        ],
    });
}


export function btn_wordListDeleteChannel(channelId, containList) {
    let btns = [];
    containList = JSON.parse(JSON.stringify(containList));

    do {
        const a1 = containList.pop()
        const a2 = containList.pop()
        if (a1 && a2) {
            btns.push(
                new Api.KeyboardButtonRow({
                    buttons: [
                        new Api.KeyboardButtonCallback({
                            text: a1.text + '',
                            data: Buffer.from(btn_callBackData.wordDeleteChannel + '_' + channelId + '_' + a1.id),
                        }),
                        new Api.KeyboardButtonCallback({
                            text: a2.text + '',
                            data: Buffer.from(btn_callBackData.wordDeleteChannel + '_' + channelId + '_' + a2.id),
                        })
                    ],
                })
            );
        } else if (a1 && !a2) {
            btns.push(
                new Api.KeyboardButtonRow({
                    buttons: [
                        new Api.KeyboardButtonCallback({
                            text: a1.text + '',
                            data: Buffer.from(btn_callBackData.wordDeleteChannel + '_' + channelId + '_' + a1.id),
                        })
                    ],
                })
            );
        } else
            break;
    } while (true);

    return new Api.ReplyInlineMarkup({
        rows: btns
    });

}

export function btn_forceInputContainWord() {
    return new Api.ReplyKeyboardForceReply({
        singleUse: true,
        selective: true
    });
}

export function btn_replaceListDeleteChannel(channelId, replaceList) {
    let btns = [];
    replaceList = JSON.parse(JSON.stringify(replaceList));

    do {
        const a1 = replaceList.pop()
        const a2 = replaceList.pop()
        if (a1 && a2) {
            btns.push(
                new Api.KeyboardButtonRow({
                    buttons: [
                        new Api.KeyboardButtonCallback({
                            text: a1.id + ': ' + truncateText(a1.text),
                            data: Buffer.from(btn_callBackData.replaceDeleteChannel + '_' + channelId + '_' + a1.id),
                        }),
                        new Api.KeyboardButtonCallback({
                            text: a2.id + ': ' + truncateText(a2.text),
                            data: Buffer.from(btn_callBackData.replaceDeleteChannel + '_' + channelId + '_' + a2.id),
                        })
                    ],
                })
            );
        } else if (a1 && !a2) {
            btns.push(
                new Api.KeyboardButtonRow({
                    buttons: [
                        new Api.KeyboardButtonCallback({
                            text: a1.id + ': ' + truncateText(a1.text),
                            data: Buffer.from(btn_callBackData.replaceDeleteChannel + '_' + channelId + '_' + a1.id),
                        })
                    ],
                })
            );
        } else
            break;
    } while (true);

    return new Api.ReplyInlineMarkup({
        rows: btns
    });

}