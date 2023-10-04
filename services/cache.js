/**
 * Custom cache module
 */

const NodeCache = require('node-cache');
const { Station } = require('../models/station');
const { History } = require('../models/history');
const { Fuel } = require('../models/fuel');
const { Brand } = require('../models/brand');


class MyCache extends NodeCache {
    constructor() {
        super();
        this.keyKnownStationIds = 'knownStationIds';
        this.keyKnownHistoryIds = 'knownHistoryIds';
        this.keyKnownFuelIds = 'knownFuelIds';
        this.keyKnownBrandIds = 'knownBrandIds';
    }

    ///// Generic methods : /////

    /**
     * Returns all ids known for the given collection
     * Ids match the field '_id' in the DB documents
     * @param {String} key key used by the cache to store the requested data
     * @param {mongoose.model} Model model linked to the collection
     * @returns array of ids
     */
    async getKnownCollectionIds(key, Model) {
        let idList = this.get(key);
        if (idList == undefined) {
            idList = await Model.find({}).select('_id');
            idList = idList.map(object => object._id);  // only keep '_id' fields
            this.set(key, idList);
        };
        return idList;
    }

    /**
     * Appends given ids into the already existing cache object
     * @param {*} key cache object's key
     * @param {*} idList list of ids
     */
    pushInKnownCollectionIds(key, idList) {
        const idListAlreadyInCache = this.get(key)
        if (idListAlreadyInCache == undefined) {
            this.set(key, idList);
        } else {
            this.set(key, idListAlreadyInCache.concat(idList));
        }
    }


    ///// Station ids cache management : /////

    async getKnownStationIds() { return this.getKnownCollectionIds(this.keyKnownStationIds, Station); }

    pushInKnownStationIds(idList) { return this.pushInKnownCollectionIds(this.keyKnownStationIds, idList); }


    ///// History ids cache management : /////

    async getKnownHistoryIds() { return this.getKnownCollectionIds(this.keyKnownHistoryIds, History); }

    pushInKnownHistoryIds(idList) { return this.pushInKnownCollectionIds(this.keyKnownHistoryIds, idList); }


    ///// Fuel ids cache management : /////

    async getKnownFuelIds() { return this.getKnownCollectionIds(this.keyKnownFuelIds, Fuel); }

    pushInKnownFuelIds(idList) { return this.pushInKnownCollectionIds(this.keyKnownFuelIds, idList); }


    ///// Brand ids cache management : /////

    async getKnownBrandIds() { return this.getKnownCollectionIds(this.keyKnownBrandIds, Brand); }

    pushInKnownBrandIds(idList) { return this.pushInKnownCollectionIds(this.keyKnownBrandIds, idList); }
}

module.exports = new MyCache();