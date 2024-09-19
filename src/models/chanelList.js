import Datastore from 'nedb';
import path from 'path';

const dbPath = path.resolve('./src/db/channelList.nedb');
const db = new Datastore({filename: dbPath, autoload: true});
db.ensureIndex({fieldName: 'channelName', unique: true}, (err) => {
    if (err) {
        console.error('Error creating unique index on channelName:', err);
    } else
        removeDuplicateRecord()
});

export function removeDuplicateRecord() {
    db.persistence.compactDatafile();
    console.log('فایل پایگاه داده فشرده و مرتب شد.');
}

export function addNewChannel(channelDialog, callback) {

    if (!channelDialog || !channelDialog?.className || !channelDialog?.id || !channelDialog?.title) {
        return callback({message: 'خطا در خواندن کانال'}, false);
    }

    const data = {
        _id: channelDialog.id,
        type: channelDialog.type,
        channelName: channelDialog.username,
        title: channelDialog.title,
        active: false,
        containList: [], //{id , text}
        replaceList: [], //{id , text, replace}
    }
    addChannel(data, callback)
}


export function addChannel(channel, callback) {
    db.insert(channel, (err, newChannel) => {
        if (err) {
            return callback(err, false);
        }
        callback(null, newChannel);
    });
}

export function getAllChannels(callback) {
    db.find({}).sort({title: 1}).exec((err, docs) => {
        if (err) {
            return callback(err);
        }
        callback(null, docs);
    });
}

export function getActiveChannelIds() {
    return new Promise((resolve, reject) => {
        db.find({active: true}, {_id: 1}).exec((err, docs) => {
            if (err) {
                console.log(err)
                resolve([]);
            }
            if (!docs) {
                console.log('empty channel _ids')
                resolve([]);
            }
            const ids = docs.map(doc => doc._id);
            resolve(ids);
        });
    });


}

export function findChannelByName(channelName, callback) {

    return new Promise((resolve, reject) => {
        findChannel({channelName: channelName}, (error, docs) => {
            if (error) {
                console.log(error)
                resolve([]);
            }
            resolve(docs[0]);
        });
    });
}

export function findChannelById(channelId) {
    return new Promise((resolve, reject) => {
        findChannel({_id: channelId}, (error, docs) => {
            if (error) {
                console.log(error)
                resolve([]);
            }
            resolve(docs[0]);
        });
    });
}

export function findChannel(query, callback) {
    db.find(query).sort({title: 1}).exec((err, docs) => {
        if (err) {
            return callback(err);
        }
        callback(null, docs);
    });
}

export function updateStatusChannel(channelId, status) {
    if (!(status === true || status === false))
        status = false;

    return new Promise((resolve, reject) => {
        updateChannel({_id: channelId},
            {active: status},
            (error, docs) => {
                if (error) {
                    console.log(error)
                    resolve(false);
                }
                resolve(true);
            });
    });
}

export function updateContainListChannel(channelName, containList) {
    if (!containList)
        containList = [];
    return new Promise((resolve, reject) => {
        updateChannel({channelName: channelName},
            {containList: containList},
            (error, docs) => {
                if (error) {
                    console.log(error)
                    resolve(false);
                }
                resolve(true);
            });
    });
}

export function updateReplaceListChannel(channelName, replaceList) {
    if (!replaceList)
        replaceList = [];
    return new Promise((resolve, reject) => {
        updateChannel({channelName: channelName},
            {replaceList: replaceList},
            (error, docs) => {
                if (error) {
                    console.log(error)
                    resolve(false);
                }
                resolve(true);
            });
    });
}

export function updateChannel(query, update, callback) {
    db.update(query, {$set: update}, {multi: true}, (err, numReplaced) => {
        if (err) {
            return callback(err);
        }
        callback(null, numReplaced);
    });
}

export function removeChannelByName(channelName, callback) {
    removeChannel({channelName: channelName}, callback)
}

export function removeChannel(query, callback) {
    db.remove(query, {multi: true}, (err, numRemoved) => {
        if (err) {
            return callback(err);
        }
        callback(null, numRemoved);
    });
}

export async function getNestedWordId(channelName) {
    return new Promise((resolve, reject) => {
        db.findOne({channelName: channelName}, {'containList.id': 1}).exec((error, docs) => {
            if (error) {
                console.log(error)
                resolve(0);
            }
            resolve(Math.max(0, ...docs.containList.id) + 1)
        });
    });
}

export async function checkExistWord(channelName, word) {
    return new Promise((resolve, reject) => {
        db.findOne({channelName: channelName, 'containList.text': word}, {}).exec((error, docs) => {
            if (error) {
                console.log(error)
                resolve(false);
            }
            if (docs?.containList?.length)
                resolve(true)
            resolve(false)
        });
    });
}

export async function addNewContainWordChannel(channelName, word, callback) {
    if (!word || typeof word != "string") {
        return callback({message: 'خطا در خواندن کلمه'}, false);
    }
    word = word.trim().toLowerCase()
    const checkExist = await checkExistWord(channelName, word)
    if (checkExist) {
        return callback({message: 'کلمه تکراری'}, false);
    }
    const newItem = {
        id: await getNestedWordId(channelName),
        text: word
    }
    db.update(
        {channelName: channelName},
        {$push: {containList: newItem}},
        {},
        callback
    );
}

export async function getNestedReplaceId(channelName) {
    return new Promise((resolve, reject) => {
        db.findOne({channelName: channelName}, {'replaceList.id': 1}).exec((error, docs) => {
            if (error) {
                console.log(error)
                resolve(0);
            }
            resolve(Math.max(0, ...docs.replaceList.id) + 1)
        });
    });
}

export async function checkExistFindTex(channelName, findText) {
    return new Promise((resolve, reject) => {
        db.findOne({channelName: channelName, 'replaceList.text': findText}, {}).exec((error, docs) => {
            if (error) {
                console.log(error)
                resolve(false);
            }
            if (docs?.replaceList?.length)
                resolve(true)
            resolve(false)
        });
    });
}

export async function addNewFindTextChannel(channelName, findText, callback) {
    if (!findText || typeof findText != "string") {
        return callback({message: 'خطا در خواندن متن'}, false);
    }
    findText = findText.trim().toLowerCase()
    const checkExist = await checkExistFindTex(channelName, findText)
    if (checkExist) {
        return callback({message: 'متن تکراری'}, false);
    }
    const newItem = {
        id: await getNestedReplaceId(channelName),
        text: findText,
        replace: null
    }
    db.update(
        {channelName: channelName},
        {$push: {replaceList: newItem}},
        {},
        (err, numReplaced) => callback(err, newItem.id)
    );
}

export async function updateReplaceValue(id, replaceId, replaceStr) {
    return new Promise((resolve, reject) => {
        db.findOne({_id: id}, async (err, doc) => {
            if (err) {
                resolve(false);
            } else if (!doc) {
                resolve(false);
            } else {
                const replaceItem = doc.replaceList.find(item => item.id === replaceId);
                if (!replaceItem) {
                    resolve(false);
                } else {
                    replaceItem.replace = replaceStr.trim().toLowerCase();
                    await db.update({_id: id}, doc, {}, (err, numReplaced) => {
                        if (err) {
                            resolve(false);
                        } else {
                            resolve(true);
                        }
                    });
                }
            }
        });
    });
}