import crypto from 'crypto';
import httpStatus from 'http-status';
import { buildSuccessfulResponse, buildErroneousResponse } from '../response';
import { getItem, putItem, incrementVisits } from '../../db';

const SHORT_URL_LENGTH = 6;
const { SHORT_URL_BASE } = process.env;

function getHash(longUrl) {
    return crypto.createHash('md5').update(longUrl).digest('hex');
}

async function getShortUrlInfo(longUrlHash, longUrl) {
    let i = 0;

    let shortUrlHash = longUrlHash.substring(i, SHORT_URL_LENGTH);
    let shortenedUrlInfo = await getItem(shortUrlHash);

    while (shortenedUrlInfo !== null && shortenedUrlInfo.longUrl !== longUrl && (SHORT_URL_LENGTH + i) < shortUrlHash.length) {
        i += 1;
        shortUrlHash = longUrlHash.substring(i, SHORT_URL_LENGTH + i);
        // eslint-disable-next-line no-await-in-loop
        shortenedUrlInfo = await getItem(shortUrlHash);
    }

    return { shortUrlHash, isNew: !shortenedUrlInfo };
}

function buildShortUrl(shortUrlHash) {
    return `${SHORT_URL_BASE}/${shortUrlHash}`;
}

async function shorten(req, res) {
    const { longUrl } = req.body;
    const longUrlHash = getHash(longUrl);
    const shortUrlInfo = await getShortUrlInfo(longUrlHash, longUrl);

    if (shortUrlInfo.isNew) {
        await putItem(shortUrlInfo.shortUrlHash, longUrl);
    }

    const response = { shortUrl: buildShortUrl(shortUrlInfo.shortUrlHash), longUrl };
    res.json(buildSuccessfulResponse(response));
}

async function stats(req, res) {
    const shortUrlHash = req.swagger.params.shortUrlHash.originalValue;
    const shortenedUrlInfo = await getItem(shortUrlHash);

    if (shortenedUrlInfo === null) {
        res.status(httpStatus.NOT_FOUND).send(buildErroneousResponse('Not found.'));
    } else {
        const { longUrl, visits } = shortenedUrlInfo;
        const response = { shortUrl: buildShortUrl(shortUrlHash), longUrl, visits };
        res.json(buildSuccessfulResponse(response));
    }
}

async function redirect(req, res) {
    const shortUrlHash = req.swagger.params.shortUrlHash.originalValue;
    const shortenedUrlInfo = await getItem(shortUrlHash);

    if (shortenedUrlInfo === null) {
        res.status(httpStatus.NOT_FOUND).send(buildErroneousResponse('Not found.'));
    } else {
        await incrementVisits(shortUrlHash);
        res.status(httpStatus.MOVED_PERMANENTLY);
        res.location(shortenedUrlInfo.longUrl);
        res.send(`
<html>
<head><title>TIER.app</title></head>
<body><a href="${shortenedUrlInfo.longUrl}">moved here</a></body>
</html>
        `.trim());
    }
}

export { shorten, redirect, stats };
