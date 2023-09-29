/**
 * Custom cache module
 */

const NodeCache = require('node-cache');
const { Station } = require('../models/station');

class MyCache extends NodeCache {
    constructor() {
        super();
        this.keyKnownStationIds = 'knownStationIds';
        this.keyKnownHistoryIds = 'knownHistoryIds';
    }

    async getKnownStationIds() {
        let listKnownStationIds = this.get(this.keyKnownStationIds);
        if (listKnownStationIds == undefined) {
            listKnownStationIds = await Station.find({}).select('_id');
            listKnownStationIds = listKnownStationIds.map(object => object._id);  // only keep '_id' fields
            this.set('knownStationIds', listKnownStationIds);
        };
        return listKnownStationIds;
    }

    pushInKnownStationIds(listStationIds) {
        const listKnownStationIdsAlreadyInDb = this.get(this.keyKnownStationIds)
        if (listKnownStationIdsAlreadyInDb == undefined) {
            this.set(this.keyKnownStationIds, listStationIds);
        } else {
            this.set('knownStationIds', listKnownStationIdsAlreadyInDb.concat(listStationIds));
        }
    }
}

module.exports = new MyCache();