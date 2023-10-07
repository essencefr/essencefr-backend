/**
 * Testing the 'routine' endpoint
 */

const request = require('supertest');  // function used to send a request to an endpoint
const mongoose = require('mongoose');

let server = null;

// function for synchronous wait
function wait(ms) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(ms)
        }, ms)
    })
}

// main test suite:
describe('/api/routine', () => {
    beforeEach(async () => {
        server = require('../../index');
        await wait(1000);  // delay in ms to let the DB connection being established
    });
    afterEach(async () => {
        server.close();
    });
    afterAll(async () => {
        await mongoose.disconnect();
    });

    describe('POST /', () => {
        test('should return the complete log on correct execution', async () => {
            const res = await request(server).post(`/api/routine`);
            console.log(res);
            // TODO
            expect(1).toBe(1);
        });
    }, 60000);
});
