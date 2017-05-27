/** @ignore */
const fs = require('fs');
/** @ignore */
const path = require('path');
/** @ignore */
const assert = require('assert');
/** @ignore */
const _ = require('lodash');
/** @ignore */
const Command = requireApp('bot/commands/Command');
/** @ignore */
const Categories = requireApp('bot/commands/Categories');
/** @ignore */
const directory = require('require-directory');

describe('app/bot/commands/...', () => {
    describe('Command Categories', () => {
        it('checks if each category has a corresponding folder with the same name', () => {
            for (let i in Categories) {
                let folder = Categories[i].name.toLowerCase();
                assert.ok(fs.existsSync(path.resolve(appRoot, 'app/bot/commands', folder)));
            }
        });
    });

    describe('Class Name => File Name', () => {
        it('checks if all commands shares a class and file name', () => {
            _.each(Categories, category => {
                _.each(directory(module, path.resolve(appRoot, 'app/bot/commands', category.name.toLowerCase())), (CommandInstance, key) => {
                    if (CommandInstance.prototype instanceof Command) {
                        let instance = new CommandInstance;
                        assert.equal(instance.constructor.name, key);
                    }
                });
             });
        });
    });
});
