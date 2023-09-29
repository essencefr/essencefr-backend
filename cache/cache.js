/**
 * Custom cache module
 */

const NodeCache = require('node-cache');
const { Station } = require('../models/station');
const { History } = require('../models/history');


class MyCache extends NodeCache {
    constructor() {
        super();
        this.keyKnownStationIds = 'knownStationIds';
        this.keyKnownHistoryIds = 'knownHistoryIds';
    }

    ///// Station ids cache management : /////

    async getKnownStationIds() {
        let listKnownStationIds = this.get(this.keyKnownStationIds);
        if (listKnownStationIds == undefined) {
            listKnownStationIds = await Station.find({}).select('_id');
            listKnownStationIds = listKnownStationIds.map(object => object._id);  // only keep '_id' fields
            this.set(this.keyKnownStationIds, listKnownStationIds);
        };
        return listKnownStationIds;
    }

    pushInKnownStationIds(listStationIds) {
        const listKnownStationIdsAlreadyInDb = this.get(this.keyKnownStationIds)
        if (listKnownStationIdsAlreadyInDb == undefined) {
            this.set(this.keyKnownStationIds, listStationIds);
        } else {
            this.set(this.keyKnownStationIds, listKnownStationIdsAlreadyInDb.concat(listStationIds));
        }
    }

    ///// History ids cache management : /////

    async getKnownHistoryIds() {
        let listKnownHistoryIds = this.get(this.keyKnownHistoryIds);
        if (listKnownHistoryIds == undefined) {
            listKnownHistoryIds = await History.find({}).select('_id');
            listKnownHistoryIds = listKnownHistoryIds.map(object => object._id);  // only keep '_id' fields
            this.set(this.keyKnownHistoryIds, listKnownHistoryIds);
        };
        return listKnownHistoryIds;
    }

    pushInKnownHistoryIds(listHistoryIds) {
        const listKnownHistoryIdsAlreadyInDb = this.get(this.keyKnownHistoryIds)
        if (listKnownHistoryIdsAlreadyInDb == undefined) {
            this.set(this.keyKnownHistoryIds, listHistoryIds);
        } else {
            this.set(this.keyKnownHistoryIds, listKnownHistoryIdsAlreadyInDb.concat(listHistoryIds));
        }
    }
}

module.exports = new MyCache();