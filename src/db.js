import mongoose from 'mongoose';
import logger from './logger';

const CONNECTION_RETRIES = process.env.MONGO_DB_CONNECTION_RETRIES || 10;
const CONNECTION_RETRY_INTERVAL = process.env.MONGO_DB_CONNECTION_RETRY_INTERVAL || 5000;
let ShortenedUrl = null;
let attemptedConnections = 0;

function connect() {
    attemptedConnections += 1;
    mongoose.connect(process.env.MONGO_DB_URL, {
        useNewUrlParser: true,
    }, (err) => {
        if (err) {
            logger.error('Db connection error', err);
            if (attemptedConnections < CONNECTION_RETRIES) {
                setTimeout(connect, CONNECTION_RETRY_INTERVAL);
                return;
            }
            process.exit(1);
        }

        logger.info('Connected to mongodb');
        const shortenedUrlSchema = new mongoose.Schema({
            shortUrlHash: String,
            longUrl: String,
            visits: Number,
        });

        ShortenedUrl = mongoose.model('ShortenedUrl', shortenedUrlSchema);
    });
}

export function setupDb() {
    connect();
}

export async function getItem(shortUrlHash) {
    return new Promise((resolve, reject) => {
        ShortenedUrl.findOne({ shortUrlHash }, (err, shortenedUrl) => {
            if (err) {
                reject(err);
                return;
            }
            if (!shortenedUrl) {
                resolve(null);
                return;
            }

            const { longUrl, visits } = shortenedUrl;
            resolve({ shortUrlHash, longUrl, visits });
        });
    });
}

export async function putItem(shortUrlHash, longUrl) {
    return new Promise((resolve, reject) => {
        const newShortenedUrl = new ShortenedUrl({ shortUrlHash, longUrl, visits: 0 });
        newShortenedUrl.save((err, shortenedUrl) => {
            if (err) {
                reject(err);
                return;
            }

            resolve(shortenedUrl.shortUrlHash);
        });
    });
}

export async function incrementVisits(shortUrlHash) {
    return new Promise((resolve, reject) => {
        ShortenedUrl.findOne({ shortUrlHash }, (err, shortenedUrl) => {
            if (err) {
                reject(err);
                return;
            }
            if (!shortenedUrl) {
                resolve(null);
                return;
            }

            ShortenedUrl.updateOne({ shortUrlHash }, { $inc: { visits: 1 } }, (error) => {
                if (error) {
                    reject(error);
                    return;
                }

                resolve({ shortUrlHash });
            });
        });
    });
}
