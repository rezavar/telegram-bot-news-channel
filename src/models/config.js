import Datastore from 'nedb';
import {deleteOldAndInsertNewOwner} from "./adminList.js";
import path from 'path';

const dbPath = path.resolve('./src/db/config.nedb');
const db = new Datastore({filename: dbPath, autoload: true});
db.ensureIndex({fieldName: 'key', unique: true}, (err) => {
    if (err) {
        console.error('Error creating unique index on key:', err);
    } else
        removeDuplicateRecord()
});

const DefaultUser = 'defaultUser'
const NewsChannel = 'newsChannel'
const MiddleNewsChat = 'middleNewsChat'
let defaultValue_user = null;
let defaultValue_group = null;
let defaultValue_channel = null;

export function removeDuplicateRecord() {
    db.persistence.compactDatafile();
    console.log('فایل پایگاه داده فشرده و مرتب شد.');
}

export function setDefaultUser(user) {

// {userId: 123,userName: 'un', phone: '09...', isAdmin: true, isOwner: true, isMaster: true };
    return new Promise((resolve, reject) => {

        _insertOtUpdate(DefaultUser, user, (err, result) => {
            defaultValue_user = null
            if (result)
                deleteOldAndInsertNewOwner(user)
            resolve(result)
        })

    });
}

export function setDefaultGroup(chat) {

    //{  id: -83340194, title: 'گروه تایید خبر' };
    return new Promise((resolve, reject) => {

        _insertOtUpdate(MiddleNewsChat, chat, (err, result) => {
            defaultValue_group = null
            resolve(result)
        })

    });
}

export function setDefaultChannel(chat) {

    //{  id: -12345, name: 'new_channelName' };
    return new Promise((resolve, reject) => {

        _insertOtUpdate(NewsChannel, chat, (err, result) => {
            defaultValue_channel = null
            resolve(result)
        })

    });
}

function _insertOtUpdate(key, value, callback) {

    db.findOne({key: key}, (err, doc) => {
        if (err) {
            console.error("Error occurred while finding the document:", err);
            callback(err, false);
        }
        if (doc) {
            db.update(
                {key: key},
                {$set: {value: value}},
                {},
                (err, numUpdated) => {
                    if (err) {
                        console.error("Error occurred while updating the document:", err);
                        callback(err, false);
                    } else {
                        console.log(`Updated document`, value);
                        callback(null, true);
                    }
                }
            );
        } else {
            db.insert(
                {key: key, value: value},
                (err, newDoc) => {
                    if (err) {
                        console.error("Error occurred while inserting the document:", err);
                        callback(err, false);
                    } else {
                        console.log("Inserted new document:", newDoc);
                        callback(null, true);
                    }
                }
            );
        }
    });
}

export async function getDefaultUser() {
    if (defaultValue_user)
        return defaultValue_user;
    else
        return defaultValue_user = await new Promise((resolve, reject) => {
            _getDefaultValue(DefaultUser, (err, result) => {
                resolve(result)
            })
        });
}

export async function getDefaultGroup() {
    if (defaultValue_group)
        return defaultValue_group;
    else
        return defaultValue_group = await new Promise((resolve, reject) => {
            _getDefaultValue(MiddleNewsChat, (err, result) => {
                resolve(result)
            })
        });
}

export async function getDefaultChannel() {
    if (defaultValue_channel)
        return defaultValue_channel;
    else
        return defaultValue_channel = await new Promise((resolve, reject) => {
            _getDefaultValue(NewsChannel, (err, result) => {
                resolve(result)
            })
        });
}

function _getDefaultValue(key, callback) {

    db.findOne({key: key}, (err, doc) => {
        if (err) {
            console.error("Error occurred while finding the document:", err);
            callback(err, false);
        }
        if (doc?.value) {
            callback(null, doc.value);
        } else {
            let msg = "not set default: ", key;
            console.error(msg);
            callback(msg, false);
        }

    });
}


