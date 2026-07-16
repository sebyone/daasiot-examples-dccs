const { getTime } = require('./daas/utils');
const { startServer } = require('./bootstrap');

async function main() {
    const runtime = await startServer();
    const address = runtime.address;
    const binding = typeof address === 'string' ? address : address.port;

    console.log(getTime(), `server listening on ${binding}`);

    const shutdown = async (signal) => {
        console.log(getTime(), `${signal} received, shutting down`);
        try {
            await runtime.stop();
            process.exitCode = 0;
        } catch (error) {
            console.error(getTime(), 'shutdown failed:', error);
            process.exitCode = 1;
        }

        const forceExit = setTimeout(() => process.exit(process.exitCode), 2000);
        forceExit.unref();
    };

    process.once('SIGINT', () => shutdown('SIGINT'));
    process.once('SIGTERM', () => shutdown('SIGTERM'));
}

if (require.main === module) {
    main().catch((error) => {
        console.error(getTime(), 'server startup failed:', error);
        process.exitCode = 1;
    });
}

module.exports = {
    main,
};
