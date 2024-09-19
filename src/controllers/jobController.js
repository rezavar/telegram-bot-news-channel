import cron from 'node-cron';
import {removeDuplicateRecord as cleanAdminLis} from "../models/adminList.js";
import {removeDuplicateRecord as cleanChannelLis} from "../models/chanelList.js";
import {removeDuplicateRecord as cleanConfig} from "../models/config.js";
import {existsSync, readdirSync, lstatSync, unlinkSync} from "fs";
import path from 'path';

const jobs = [
    {
        jobName: 'persistDB',
        jobFunction: persistDB,
        jobLogInfo: 'set job persist DataBase on 06:00',
        jobTime: '0 06 * * *' // اعت 6 صبح هر روز
    },
    {
        jobName: 'deleteAllFilesInTmpDirectory',
        jobFunction: deleteAllFilesInTmpDirectory,
        jobLogInfo: 'set job deleteAllFilesInTmpDirectory  on 05:00',
        jobTime: '0 05 * * *' // اعت 6 صبح هر روز
    },
];

export function getRunnerJobs() {
    const tasks = cron.getTasks();
    let list = [];
    for (let [key, value] of tasks.entries()) {
        console.log("key", key)
        list.push(key)
        // console.log("value", value.lastExecution)
    }
    return list;
}

export function setupJobs() {

    jobs.forEach(job => {
        console.log(job.jobLogInfo)
        cron.schedule(job.jobTime, job.jobFunction, {name: job.jobName});
    })
}


function persistDB() {
    console.log('run persist job')
    cleanAdminLis();
    cleanChannelLis();
    cleanConfig();
}

export function deleteAllFilesInTmpDirectory() {
    const directoryPath = process.cwd() + '/src/tmp/'
    const directoryPath2 = path.resolve('./src/tmp/');
    console.log(1, directoryPath)
    console.log(2, directoryPath2)
    return;
    if (existsSync(directoryPath)) {
        const files = readdirSync(directoryPath);

        files.forEach((file) => {
            const filePath = path.join(directoryPath, file);
            if (lstatSync(filePath).isFile())
                unlinkSync(filePath);
        });
    } else
        console.log('not exist')
}