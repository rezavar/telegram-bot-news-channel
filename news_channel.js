import cluster from 'cluster';
import {main} from "./src/controllers/mainController.js";

if (cluster.isMaster) {

    cluster.fork();
    cluster.on('exit', async function (worker, code, signal) {
        if (Number(code) !== 2)
            cluster.fork();
    });
}

if (cluster.isWorker) {
    main()
}