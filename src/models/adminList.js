import Datastore from 'nedb';
import {defaultOwner} from "../config/constant.js";
import path from 'path';

const dbPath = path.resolve('./src/db/admin.nedb');
const db = new Datastore({filename: dbPath, autoload: true});
db.ensureIndex({fieldName: 'userId', unique: true}, (err) => {
    if (err) {
        console.error('Error creating unique index on name:', err);
    } else
        removeDuplicateRecord()
});

export function removeDuplicateRecord() {
    db.persistence.compactDatafile();
    console.log('فایل پایگاه داده فشرده و مرتب شد.');
}

export function addAdmin(userId, userName, phone, callback) {
    if (!userId)
        return;
    const data = {
        userId: userId,
        userName: userName,
        phone: phone,
        isAdmin: true,
        isOwner: false,
    }
    _addAdmin(data, callback)
}

export function addOwner(userName, userId, callback) {
    const data = {
        userId: userId,
        userName: userName,
        isAdmin: true,
        isOwner: true,
    }
    _addAdmin(data, callback)
}

export function deleteOldAndInsertNewOwner(user) {
    removeById(user.userId, (error, newRecord) => {
        if (error) {
            console.error(error);
        } else {
            db.insert(user, (err, newDoc) => {
                if (err) {
                    console.error('Error inserting default owner:', err);
                } else {
                    console.log('Default owner added');
                }
            });
        }
    })
}

function _addAdmin(admin, callback) {
    db.insert(admin, (err, newAdmin) => {
        if (err) {
            return callback(err, false);
        }
        callback(null, newAdmin);
    });
}

export function getAllAdmins() {
    return _getAll({isAdmin: true}, {});
}

export function getAllOwners(callback) {
    return _getAll({isOwner: true}, {});
}

function _getAll(query, projection) {
    return new Promise((resolve, reject) => {
        db.find(query, projection).sort({userName: 1}).exec((error, docs) => {
            if (error) {
                console.log(error)
                resolve([]);
            }
            resolve(docs);
        });
    });
}

export function getAdminIds() {
    return _getAllIds({isAdmin: true});
}

export function getOwnerIds() {
    return _getAllIds({isOwner: true});
}

function _getAllIds(query, projection = {userId: 1}) {

    return new Promise((resolve, reject) => {
        db.find(query, projection).sort({userName: 1}).exec((error, docs) => {
            if (error) {
                console.log(error)
                resolve([]);
            }
            const ids = docs.map(doc => doc.userId);
            resolve(ids);
        });
    });


}

export function findAdminById(userId) {
    return new Promise((resolve, reject) => {
        db.findOne({userId: userId}).exec((error, doc) => {
            if (error) {
                console.log(error)
                resolve({});
            }
            if (!doc)
                resolve({})
            resolve(doc);
        });
    });

}

function _findAdmin(query, callback) {
    db.find(query).sort({userName: 1}).exec((err, docs) => {
        if (err) {
            return callback(err);
        }
        callback(null, docs);
    });
}

export function removeById(userId, callback) {
    if (userId === defaultOwner.userId) return;
    _removeAdmin({userId: Number(userId)}, callback)
}

function _removeAdmin(query, callback) {
    db.remove(query, {multi: true}, (err, numRemoved) => {
        if (err) {
            return callback(err);
        }
        callback(null, numRemoved);
    });
}

export function editOwner(userId, isOwner, callback) {
    if (!userId) return;
    if (userId === defaultOwner.userId) return;
    db.update(
        {userId: userId},
        {$set: {isOwner: isOwner}},
        {},
        (err, numAffected) => {
            if (err) {
                console.error('Error updating isOwner:', err);
                if (callback) callback(err, null);
            } else {
                if (callback) callback(null, numAffected);
            }
        }
    );
}
