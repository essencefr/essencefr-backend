/**
 * Modules with functions to manipulate files
 */

const fs = require('fs');

/**
 * Remove content of all files in specified directory (does not apply on sub-directories)
 * @param {String} dir directory path. Should end with '/'
 */
function cleanFiles(dir) {
    if (!fs.existsSync(dir)) {
        throw new Error(`Given directory to clean does not exist: '${dir}'`);
    }
    // reset temp log files:
    const files = fs.readdirSync(dir);
    for (filename of files) {
        // overwrite file content (remove all content):
        fs.writeFileSync(dir + filename, '', err => {
            if (err) { console.error(err); }
        });
    }
}

module.exports.cleanFiles = cleanFiles;