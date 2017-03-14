/** @ignore */
const directory = require('require-directory');

/** @ignore */
let map = {};
/** @ignore */
let items = directory(module, './');

for (let item in items) {
    for (let constant in items[item]) {
        map[constant] = items[item][constant];
    }
}

module.exports = map;
