/** @ignore */
const CacheManager = requireApp('utils/cache/CacheManager');
/** @ignore */
const assert = require('assert');

describe('app/utils/cache/CacheManager::file', () => {
    let cache = CacheManager.resolveAdapter('file');

    before(() => {
        cache.parseOptions({
            path: 'storage/cache/tests'
        });
    });

    after(() => {
        cache.flush();

        const fs = require('fs-extra');
        const path = require('path');

        fs.removeSync(path.resolve('storage/cache/tests'));
    });

    describe('#put()', () => {
        it('can store data', () => {
            assert.doesNotThrow(() => {
                return cache.put('cache.token', 'string', 5);
            });
        });

        it('has the stored data', () => {
            assert.equal(true, cache.has('cache.token'));
            assert.equal('string', cache.get('cache.token'));
        });
    });

    describe('#remember()', () => {
        it('can store data through a callback', () => {
            assert.doesNotThrow(() => {
                return cache.remember('cache.remember', 5, () => {
                    return 'string';
                });
            });
        });

        it('returns the value it stored in the cache', () => {
            assert.equal('returnedValue', cache.remember('cache.remember.returned', 5, () => {
                return 'returnedValue';
            }));
        });

        it('returns the value of the cache if it already exists', () => {
            assert.equal(true, cache.has('cache.remember.returned'));
            assert.equal('returnedValue', cache.remember('cache.remember.returned', 5, () => {}));
        });

        it('has the stored data', () => {
            assert.equal(true, cache.has('cache.remember'));
            assert.equal(true, cache.has('cache.remember.returned'));
            assert.equal('string', cache.get('cache.remember'));
            assert.equal('returnedValue', cache.get('cache.remember.returned'));
        });
    });

    describe('#forever()', () => {
        it('can store data for a very long time', () => {
            assert.doesNotThrow(() => {
                return cache.forever('cache.test.forever', 'string');
            });
        });

        it('has the stored data', () => {
            assert.equal(true, cache.has('cache.test.forever'));
            assert.equal('string', cache.get('cache.test.forever'));
        });
    });

    describe('#get()', () => {
        it('returns undefined if the token doesnt exists', () => {
            assert.equal(undefined, cache.get('cache.test.token'));
        });

        it('returns the provided default value given if the token doesnt exists', () => {
            assert.equal('Fallback value', cache.get('cache.test.token', 'Fallback value'));
        });

        it('returns the right value given if the token does exists', () => {
            cache.put('cache.test.token', 'This is a test', 1);
            assert.equal('This is a test', cache.get('cache.test.token'));
        });
    });

    describe('#getRaw()', () => {
        it('returns an object with expiry time and data properties', () => {
            let result = cache.getRaw('cache.getraw.token');

            assert.equal(true, result.hasOwnProperty('expire'));
            assert.equal(true, result.hasOwnProperty('data'));
        });

        it('returns undefined data if the token doesnt exists', () => {
            assert.equal(undefined, cache.getRaw('cache.getraw.token').data);
        });

        it('returns the provided default value given if the token doesnt exists', () => {
            assert.equal('Fallback value', cache.getRaw('cache.getraw.token', 'Fallback value').data);
        });

        it('returns the right value given if the token does exists', () => {
            cache.put('cache.getraw.token', 'This is a test', 1);
            assert.equal('This is a test', cache.getRaw('cache.getraw.token').data);
        });
    });

    describe('#has()', () => {
        it('returns false if the token doesnt exists', () => {
            assert.equal(false, cache.has('cache.test.has'));
        });

        it('returns true if the token exists', () => {
            cache.put('cache.test.has', 'something', 1);
            assert.equal(true, cache.has('cache.test.has'));
        });
    });

    describe('#forget()', () => {
        it('returns true if the token was removed', () => {
            cache.put('cache.test.forget', 'something', 1);
            assert.equal(true, cache.forget('cache.test.forget'));
        });

        it('returns false if nothing was removed', () => {
            assert.equal(false, cache.forget('cache.test.forget'));
        });
    });

    describe('#flush()', () => {
        it('deletes all cache entities', () => {
            cache.put('cache.test.1', 'string', 5);
            cache.put('cache.test.2', 'string', 5);
            cache.put('cache.test.3', 'string', 5);

            assert.equal(true, cache.has('cache.test.1'));
            assert.equal(true, cache.has('cache.test.2'));
            assert.equal(true, cache.has('cache.test.3'));

            cache.flush();

            assert.equal(false, cache.has('cache.test.1'));
            assert.equal(false, cache.has('cache.test.2'));
            assert.equal(false, cache.has('cache.test.3'));
        });
    });
});
