/**
 * Transactoin-related functions/wrappers
 */

const mongoose = require('mongoose');


async function runInMongooseTransaction(callback) {
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

module.exports.runInMongooseTransaction = runInMongooseTransaction;