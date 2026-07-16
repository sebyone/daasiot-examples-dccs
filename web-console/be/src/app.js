const cors = require('cors');
const express = require('express');
const path = require('path');
const logger = require('morgan');

const { errorHandler, notFoundHandler } = require('./middleware/errors');
const { createHealthRouter } = require('./routes/health');
const { createApiRouter } = require('./routes/api');
const viewRouter = require('./routes/views');
const swaggerApp = require('./swagger');

function createApp({
    daasApi,
    daasService,
    ddoService,
    database,
    runtimeState,
    requestLogger = logger('dev'),
}) {
    const app = express();

    app.disable('x-powered-by');
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, 'views'));
    app.set('daasApi', daasApi);
    app.set('runtimeState', runtimeState);

    app.use(cors());
    app.use(requestLogger);
    app.use(express.json({ limit: '1mb' }));
    app.use(express.urlencoded({ extended: false, limit: '1mb' }));

    app.use('/health', createHealthRouter({ runtimeState }));
    app.use('/', viewRouter);
    app.use('/api', createApiRouter({
        daasApi,
        daasService,
        ddoService,
        database,
        runtimeState,
    }));
    app.use('/static', express.static(path.join(__dirname, '..', 'static', 'public')));
    app.use(swaggerApp);

    app.use(notFoundHandler);
    app.use(errorHandler);

    return app;
}

module.exports = {
    createApp,
};
