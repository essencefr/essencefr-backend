/**
 * Custom cache module
 */

const NodeCache = require('node-cache');
const { Station } = require('../models/station');

class MyCache extends NodeCache {
    constructor() {
        super();
        this.keyKnownStationIds = 'knownStationIds';
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

    clearKnownStationIds() { this.del(this.keyKnownStationIds); }
    
}

module.exports = new MyCache();