/**
 * Filter functions
 */


/**
 * Separate a list of objects in two arrays:
 *  - one containing the objects whose id is unkown in the given id list
 *  - one containing the objects whose id is already known in the given id list
 * @param {Array<Object>} objectList list of objects (they must have at least an '_id' field)
 * @param {Array<Number>} idsList list of ids
 */
function filterKnownObjects(objectList, idsList) {
    // prepare output:
    let objectsFiltered = {
        objectsNew: [],      // object with _id unknown in the id list
        objectsKnown: []     // object with _id already known in the id list
    };
    // filter elements:
    objectList.forEach((object) => {
        if (idsList.includes(object._id)) {
            objectsFiltered.objectsKnown.push(object);
        } else {
            objectsFiltered.objectsNew.push(object);
        };
    });
    return objectsFiltered;
};

module.exports.filterKnownObjects = filterKnownObjects;