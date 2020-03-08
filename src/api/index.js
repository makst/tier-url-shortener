import express from 'express';
import swaggerTools from 'swagger-tools';
import yamljs from 'yamljs';
import logger from '../logger';
import { setupDb } from '../db';
import { notFound, internalServerError, backingServiceValidationError } from './middlewares/error';
import { getErroneousCallsLogger, getSuccessfulCallsLogger } from './middlewares/logging';

const port = process.env.PORT || 3000;
const app = express();

setupDb();

swaggerTools.initializeMiddleware(yamljs.load(`${__dirname}/swagger.yml`), (middleware) => {
    console.log('i am here');
    app.use(getErroneousCallsLogger());
    app.use(getSuccessfulCallsLogger());

    // Interpret Swagger resources and attach metadata to request
    // must be first in swagger-tools middleware chain
    app.use(middleware.swaggerMetadata());

    // Validate Swagger requests
    app.use(middleware.swaggerValidator({
        validateResponse: true,
    }));

    // Route validated requests to appropriate controller
    app.use(middleware.swaggerRouter({
        controllers: `${__dirname}/controllers`,
    }));

    // Serve the Swagger documents and Swagger UI
    app.use(middleware.swaggerUi({
        apiDocs: '/swagger.json',
        swaggerUi: '/docs',
    }));

    app.use(notFound);
    app.use(backingServiceValidationError);
    app.use(internalServerError);

    app.listen(port, () => {
        logger.info(`Starting on port ${port}`);
    });
});

