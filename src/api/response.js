// response format: https://github.com/omniti-labs/jsend
function buildSuccessfulResponse(data) {
    return {
        status: 'success',
        data,
    };
}

function buildErroneousResponse(message, data, code) {
    return {
        status: 'error',
        message,
        code,
        data,
    };
}

function buildFailureResponse(data) {
    return {
        status: 'fail',
        data,
    };
}

export { buildSuccessfulResponse, buildErroneousResponse, buildFailureResponse };
