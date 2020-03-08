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
                        message: 'Cannot find what you are asking for!',
                    });
                });
        });
    });
});
