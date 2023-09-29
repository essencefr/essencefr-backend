/**
 * Transactoin-related functions/wrappers
 */

const mongoose = require('mongoose');


async function runInNewMongooseTransaction(callback) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        await callback(session);
        await session.commitTransaction();  // commit transaction
    } catch (e) {
        await session.abortTransaction();
        throw Error(e);
    } finally {
        await session.endSession();
    }
};

async function runInMongooseTransaction(session, callback) {
    if(session) {  // i.e. a transaction has already been initialized
        await callback(session);  // execute the call back within this transaction
    } else {
        await runInNewMongooseTransaction(async (session) => { await callback(session) });  // init a new transaction
    };
};

module.exports.runInNewMongooseTransaction = runInNewMongooseTransaction;
module.exports.runInMongooseTransaction = runInMongooseTransaction;