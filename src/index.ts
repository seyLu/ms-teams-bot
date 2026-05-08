import './env';

import * as http from 'node:http';

async function startServer() {
    let errToReport: unknown = null;
    try {
        const app = require('./app/app').default;
        try {
            await app.start(process.env.PORT || process.env.port || 3978);
            console.log(
                `\nAgent started, app listening to`,
                process.env.PORT || process.env.port || 3978,
            );
            return; // successfully started!
        } catch (e) {
            errToReport = e;
            console.error('app.start crashed:', e);
        }
    } catch (e) {
        errToReport = e;
        console.error('require app crashed:', e);
    }

    // if we reached here, there was an error
    http.createServer((_req, res) => {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        const err = errToReport as Error;
        res.end(err?.stack || err?.toString() || 'Unknown error');
    }).listen(process.env.PORT || process.env.port || 3978);
}

startServer();
