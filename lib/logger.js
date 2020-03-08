import winston from 'winston';

const level = process.env.LOG_LEVEL || 'debug';

const logger = new winston.Logger({
    transports: [
        new winston.transports.Console({
            level,
            timestamp: () => (new Date()).toISOString(),
            silent: process.env.NODE_ENV === 'test',
        }),
    ],
});

export default logger;
