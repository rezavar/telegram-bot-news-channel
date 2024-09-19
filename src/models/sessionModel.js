import {existsSync, readFileSync, writeFileSync} from "fs";
import path from 'path'


const sessionFilePath = path.resolve('./src/db/session.txt');

export function getSession() {
    if (existsSync(sessionFilePath)) {
        const sessionData = readFileSync(sessionFilePath, 'utf8');
        return sessionData || '';
    }
    return '';
}

export function setSession(session) {
    writeFileSync(sessionFilePath, session, 'utf8');
}