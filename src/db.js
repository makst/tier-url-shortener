import mongoose from 'mongoose';
import logger from './logger';

mongoose.connect(process.env.MONGO_DB_URL, { useNewUrlParser: true });

let ShortenedUrl = null;

export function setupDb() {
    const db = mongoose.connection;
    db.on('error', (error) => {
        logger.error('Db connection error', error);
        process.exit(1);
    });

    db.once('open', () => {
        const shortenedUrlSchema = new mongoose.Schema({
            shortUrl: String,
            longUrl: String,
            visits: Number,
        });

        ShortenedUrl = mongoose.model('ShortenedUrl', shortenedUrlSchema);
    });
}

export async function getItem(shortUrl) {
    return new Promise((resolve, reject) => {
        ShortenedUrl.findOne({ shortUrl }, (err, shortenedUrl) => {
            if (err) {
                reject(err);
                return;
            }
            if (!shortenedUrl) {
                resolve(null);
                return;
            }

            const { longUrl, visits } = shortenedUrl;
            resolve({ shortUrl, longUrl, visits });
        });
    });
}

export async function putItem(shortUrl, longUrl) {
    return new Promise((resolve, reject) => {
        const newShortenedUrl = new ShortenedUrl({ shortUrl, longUrl, visits: 0 });
        newShortenedUrl.save((err, shortenedUrl) => {
            if (err) {
                reject(err);
                return;
            }

            resolve(shortenedUrl.shortUrl);
        });
    });
}
