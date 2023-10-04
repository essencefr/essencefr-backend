/**
 * Transactoin-related functions/wrappers
 */

const mongoose = require('mongoose');
const EventEmitter = require('events');

const transactionEventEmitter = new EventEmitter();
transactionEventEmitter.setMaxListeners(0);  // disable the max limit of listeners to not display warning message (caution: this message can be helpful to detect memory leaks)

const TRANSACTION_COMPLETE = 'transaction_complete';

/**
 * Perform instructions within 'session.withTransaction'
 * @param {reference} callback instructions to perform within the transaction
 */
async function runInNewMongooseTransaction(callback) {
    const session = await mongoose.startSession();
    await session.withTransaction(async () => {
        await callback(session);
    });
    await session.endSession();
    // Emits an event:
    transactionEventEmitter.emit(TRANSACTION_COMPLETE);
};

/**
 * Wrapper to perform instructions within mongoose transaction
 * @param {mongoose.session | null} session session reference to perform the instructions inside a transaction already initialized. if null, a new session will be initialized.
 * @param {reference} callback instructions to perform
 */
async function runInMongooseTransaction(session, callback) {
    if (session) {  // i.e. a transaction has already been initialized
        await callback(session);  // execute the callback within this transaction
    } else {
        await runInNewMongooseTransaction(async (session) => { await callback(session) });  // init a new transaction
    };
};

/**
 * Define operations that should be performed on the next mongoose transaction ending.
 * These operations will only be performed once.
 * The callback should NOT be async (async management not implemented yet)
 * 
 * @param {reference} callback function with instructions to perform
 */
function executeAfterMongooseTransaction(callback) {
    transactionEventEmitter.once(TRANSACTION_COMPLETE, callback);
}

module.exports.runInNewMongooseTransaction = runInNewMongooseTransaction;
module.exports.runInMongooseTransaction = runInMongooseTransaction;
module.exports.executeAfterMongooseTransaction = executeAfterMongooseTransaction;