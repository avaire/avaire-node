/** @ignore */
const Process = requireApp('utils/process/Process');
/** @ignore */
const assert = require('assert');

describe('app/utils/process/Process', () => {
    describe('#getProperty()', () => {
        it('returns value is no properties is given', () => {
            let array = ['John', 'Jane'];
            let object = {
                users: array,
                someProp: 1337,
                somethingElse: {
                    array
                }
            };

            assert.equal('something', Process.getProperty('something'));
            assert.equal(1337, Process.getProperty(1337));
            assert.equal(array, Process.getProperty(array));
            assert.equal(object, Process.getProperty(object));
        });

        it('returns null if a property is given that doesn\'t exists on the context', () => {
            let object = {
                name: 'John Doe',
                age: 31,
                email: 'john.doe@example.com'
            };

            assert.equal(null, Process.getProperty(object, 'something'));
            assert.equal(null, Process.getProperty(object, ['something']));
            assert.equal(null, Process.getProperty(object, ['name', 'something']));
        });

        it('returns the right value for the given context if a valid property list is given', () => {
            let object = {
                server: 'AvaIre Central',
                author: {
                    name: 'John Doe',
                    age: 31,
                    email: 'john.doe@example.com',
                    rank: {
                        name: 'Admin'
                    }
                }
            };

            assert.equal(object.server, Process.getProperty(object, 'server'));
            assert.equal(object.server, Process.getProperty(object, ['server']));
            assert.equal(object.author, Process.getProperty(object, 'author'));
            assert.equal(object.author, Process.getProperty(object, ['author']));
            assert.equal(object.author.age, Process.getProperty(object, ['author', 'age']));
            assert.equal(object.author.name, Process.getProperty(object, ['author', 'name']));
            assert.equal(object.author.email, Process.getProperty(object, ['author', 'email']));
            assert.equal(object.author.rank, Process.getProperty(object, ['author', 'rank']));
            assert.equal(object.author.rank.name, Process.getProperty(object, ['author', 'rank', 'name']));
        });
    });
});
