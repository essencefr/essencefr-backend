/**
 * Testing the generic update feature
 */

const { convertStationsFormat } = require('../../../utils/convert');


describe('update feature', () => {
    test('processing raw data with missing fields should raise an error', () => {
        const stationsDataRaw = [
            { id: 1, name: 'a' },
        ];
        // ensure that a validation error is thrown:
        expect(() => {
            convertStationsFormat(stationsDataRaw);
        }).toThrow(/validation error/i);
    });
});