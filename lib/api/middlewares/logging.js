import morgan from 'morgan';
import logger from '../../logger';

function getErroneousCallsLogger() {
    return morgan('tiny', {
        skip: (req, res) => res.statusCode < 400,
        stream: {
            write: logger.error,
        },
    });
}

function getSuccessfulCallsLogger() {
    return morgan('tiny', {
        skip: (req, res) => res.statusCode >= 400,
        stream: {
            write: logger.info,
        },
    });
}

export { getErroneousCallsLogger, getSuccessfulCallsLogger };
