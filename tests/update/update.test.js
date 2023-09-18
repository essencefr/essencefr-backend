/**
 * Testing the update feature
 */

const mongoose = require('mongoose');
const { Station } = require('../../models/station');

// main test suite:
describe('update', () => {
    afterAll(() => { mongoose.disconnect(); });

    describe('temp-testsuite', () => {
        test('tesmp-test', () => {
            console.log('Write your test here...');
            expect(1).toBe(1);
        });
    });
});