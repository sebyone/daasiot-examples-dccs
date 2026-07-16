function notFoundHandler(req, res) {
    res.status(404).send({
        error_name: 'NotFound',
        message: `Endpoint ${req.method} ${req.originalUrl} non trovato.`,
    });
}

function errorHandler(error, _req, res, _next) {
    const status = error.status || error.statusCode || 500;

    if (res.headersSent) {
        return;
    }

    if (status >= 500) {
        console.error(error);
    }

    res.status(status).send({
        error_name: error.name || 'Error',
        message: error.message || 'Errore interno del server.',
    });
}

module.exports = {
    errorHandler,
    notFoundHandler,
};
