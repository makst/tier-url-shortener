import crypto from 'crypto';
import { buildSuccessfulResponse } from '../response';
import { getItem, putItem } from '../../db';

const SHORT_URL_LENGTH = 6;

function getHash(longUrl) {
    return crypto.createHash('md5').update(longUrl).digest('hex');
}

async function getShortUrlInfo(longUrlHash, longUrl) {
    let i = 0;

    let shortUrl = longUrlHash.substring(i, SHORT_URL_LENGTH);
    let shortenedUrlInfo = await getItem(shortUrl);

    while (shortenedUrlInfo !== null && shortenedUrlInfo.longUrl !== longUrl && (SHORT_URL_LENGTH + i) < shortUrl.length) {
        i += 1;
        shortUrl = longUrlHash.substring(i, SHORT_URL_LENGTH + i);
        // eslint-disable-next-line no-await-in-loop
        shortenedUrlInfo = await getItem(shortUrl);
    }

    return { shortUrl, isNew: !shortenedUrlInfo };
}

async function shorten(req, res, next) {
    const { longUrl } = req.body;
    const longUrlHash = getHash(longUrl);
    const shortUrlInfo = await getShortUrlInfo(longUrlHash, longUrl);

    if (shortUrlInfo.isNew) {
        await putItem(shortUrlInfo.shortUrl, longUrl);
    }

    const response = { shortUrl: shortUrlInfo.shortUrl, longUrl };
    res.json(buildSuccessfulResponse(response));
}

export { shorten };
