/**
 * Testing the routine feature
 */

const mongoose = require('mongoose');
const { clearCollections, connectToDB } = require('../../common');
const { updateRoutineZone } = require('../../../services/update/routine');
const { Fuel } = require('../../../models/fuel');


let cache = null;

// main test suite:
describe('save/update history feature', () => {
    beforeAll(async () => {
        cache = require('../../../services/cache');
        connectToDB();
        await clearCollections();
    });
    afterEach(async () => {
        await clearCollections();
        cache.flushAll();
    });
    afterAll(async () => {
        await mongoose.disconnect();
    });

    describe('update routine zone', () => {
        test('data should be present in the DB anfter updating a zone', async () => {
            // Pessac coordinates:
            const latitude = 44.806;
            const longitude = -0.631;
            await updateRoutineZone(latitude, longitude);
            const doc = await Fuel.findById(1);  // At least 'gazole' fuel will very probably be added (id: 1)
            expect(doc).toBeDefined();
            expect(doc).not.toBe(null);
            expect(doc.name).toBe('Gazole');
        }, 60000);  // set timeout to 1 min
    });
});