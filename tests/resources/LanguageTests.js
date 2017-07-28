/** @ignore */
const fs = require('fs');
/** @ignore */
const path = require('path');
/** @ignore */
const _ = require('lodash');
/** @ignore */
const assert = require('assert');
/** @ignore */
const directory = require('require-directory');

describe('resources/lang/...', () => {
    describe('Language files', () => {
        it('returns a valid JSON object ', () => {
            _.each(directory(module, path.resolve(appRoot, 'resources', 'lang')), (json, language) => {
                _.each(directory(module, path.resolve(appRoot, 'resources', 'lang', language)), (__val, file) => {
                    let languageFile = path.resolve(appRoot, 'resources', 'lang', language, file);

                    if (fs.existsSync(languageFile + '.json')) {
                        try {
                            let json = require(languageFile + '.json');
                        } catch (err) {
                            return assert.fail(languageFile + ' does not contain a valid json object.');
                        }
                        return;
                    }

                    _.each(directory(module, path.resolve(appRoot, 'resources', 'lang', language, file)), (___val, subFile) => {
                        try {
                            let json = require(path.resolve(languageFile, subFile) + '.json');
                        } catch (err) {
                            return assert.fail(path.resolve(languageFile, subFile) + ' does not contain a valid json object.');
                        }
                    });
                });
            });
        });
    });
});
