/** @ignore */
const path = require('path');
/** @ignore */
const _ = require('lodash');
/** @ignore */
const directory = require('require-directory');

// Loads the bootstraping application and prepares it for
// use so the rest of the application can be bootstraped.
const app = require('../application');

// Setup global app root path
global.appRoot = path.join(__dirname, '../');

// Prepare a global require application function that can be used
// to get any class easier from within the ./app directory.
global.requireApp = function (name) {
    if (name.substr(0, 1) === '/' || name.substr(0, 1) === '\\') {
        name = name.substr(1, name.length);
    }

    return require(path.resolve('app', name));
};

// Loads in all of the dependencies that are required
// to run Ava and prepares them for use.
app.bootstrapTests().then(() => {
    // Registers and prepares the events, services and prefixes that Ava uses.
    app.registerEventsServicesAndPrefixes();
});

// Loads and exports all of the test cases to mocha so they can be used.
module.exports = directory(module, '.');
