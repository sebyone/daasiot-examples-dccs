const { startServer } = require('../src/bootstrap');

async function main() {
    console.log('runtime', process.version, process.platform, process.arch);
    const runtime = await startServer({ port: 0 });

    try {
        const port = runtime.address.port;
        for (const path of ['/health/live', '/health/ready', '/api/version', '/api/status']) {
            const response = await fetch(`http://127.0.0.1:${port}${path}`);
            console.log(path, response.status, await response.text());
        }
    } finally {
        await runtime.stop();
        console.log('STOPPED');
    }
}

main().catch((error) => {
    console.error('SMOKE_FAILED', error);
    process.exitCode = 1;
});
