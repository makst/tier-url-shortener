import httpStatus from 'http-status';
import logger from '../../logger';
import { buildErroneousResponse, buildFailureResponse } from '../response';
import { SWAGGER } from '../constants';

function notFound(req, res) {
    res.status(httpStatus.NOT_FOUND)
        .send(buildErroneousResponse('Not found.'));
}

function backingServiceValidationError(err, req, res, next) { // eslint-disable-line no-unused-vars
    if (err.type === 'BACKING_SERVICE_ERROR') {
        logger.error(err.message, err.data);
        res.status(httpStatus.UNPROCESSABLE_ENTITY)
            .send(buildFailureResponse(err.data));
    } else {
        next(err);
    }
}

function internalServerError(err, req, res, next) { // eslint-disable-line no-unused-vars
    if (SWAGGER[err.code]) {
        logger.error('Received an error from swagger tools middleware.', err.message, err.code, err.results, err.stack);
    } else {
        logger.error(err.message, err);
    }

    res.status(httpStatus.INTERNAL_SERVER_ERROR)
        .send(buildErroneousResponse('Oh no, something went wrong :('));
}

export { backingServiceValidationError, notFound, internalServerError };
