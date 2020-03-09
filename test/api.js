import request from 'supertest';
import chai from 'chai';

const api = `http://localhost:${process.env.PORT}`;

describe('API test', () => {
    describe('/unknown/resourse', () => {
        it('returns 404', async () => {
            await request(api)
                .get('/unknown/resourse')
                .set('Accept', 'application/json')
                .expect((res) => {
                    chai.expect(res.status).to.eql(404);
                    chai.expect(res.body).to.eql({
                        status: 'error',
                        message: 'Not found.',
                    });
                });
        });
    });

    describe('/v1/shorten', () => {
        it('returns shortened url response', async () => {
            await request(api)
                .post('/v1/shorten')
                .send({ longUrl: 'https://www.npmjs.com/package/supertest' })
                .set('Accept', 'application/json')
                .expect((res) => {
                    chai.expect(res.status).to.eql(200);
                    chai.expect(res.body).to.eql({
                        status: 'success',
                        data: {
                            shortUrl: 'http://localhost:3000/ada3fb',
                            longUrl: 'https://www.npmjs.com/package/supertest',
                        },
                    });
                });
        });
    });

    describe('/v1/stats', () => {
        it('returns stats url response', async () => {
            await request(api)
                .get('/v1/stats/ada3fb')
                .set('Accept', 'application/json')
                .expect((res) => {
                    chai.expect(res.status).to.eql(200);
                    chai.expect(res.body.status).to.eql('success');
                    // eslint-disable-next-line no-unused-expressions
                    chai.expect(res.body.data).to.not.be.null;
                    chai.expect(res.body.data.visits).to.be.a('number');
                });
        });
    });

    describe('/v1/{shortUrl}', () => {
        it('redirect to the corresponding long url', async () => {
            await request(api)
                .get('/v1/ada3fb')
                .set('Accept', 'application/json')
                .expect((res) => {
                    chai.expect(res.status).to.eql(301);
                    chai.expect(res.header.location).to.eql('https://www.npmjs.com/package/supertest');
                    chai.expect(res.text).to.eql(`
<html>
<head><title>TIER.app</title></head>
<body><a href="https://www.npmjs.com/package/supertest">moved here</a></body>
</html>
                    `.trim());
                });
        });

        it('redirects should increment visits', async () => {
            let visitsBefore;
            await request(api)
                .get('/v1/stats/ada3fb')
                .set('Accept', 'application/json')
                .expect((res) => {
                    visitsBefore = res.body.data.visits;
                });

            await request(api).get('/v1/ada3fb').set('Accept', 'application/json');
            await request(api).get('/v1/ada3fb').set('Accept', 'application/json');
            await request(api).get('/v1/ada3fb').set('Accept', 'application/json');

            let visitsAfter;
            await request(api)
                .get('/v1/stats/ada3fb')
                .set('Accept', 'application/json')
                .expect((res) => {
                    visitsAfter = res.body.data.visits;
                });

            chai.expect(visitsAfter - visitsBefore).to.eql(3);
        });
    });
});
