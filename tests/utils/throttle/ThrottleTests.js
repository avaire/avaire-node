/** @ignore */
const assert = require('assert');
/** @ignore */
const sinon = require('sinon');

describe('app/utils/throttle/Throttle', () => {
    before(() => {
        this.clock = sinon.useFakeTimers();
    });

    after(() => {
        this.clock.restore();
    });

    describe('#can()', () => {
        it('returns true until the throttle limit is hit', () => {
            let fingerprint = 'throttle-tests.fingerprint';

            assert.equal(true, app.throttle.can(fingerprint, 2, 3));
            assert.equal(true, app.throttle.can(fingerprint, 2, 3));
            assert.equal(false, app.throttle.can(fingerprint, 2, 3));

            this.clock.tick(3500);

            assert.equal(true, app.throttle.can(fingerprint, 2, 3));
        });
    });

    describe('#getThrottleItem()', () => {
        it('returns a raw memory cache item', () => {
            let fingerprint = 'throttle-tests.item';
            let item = app.throttle.getThrottleItem(fingerprint);

            assert.equal('Object', item.constructor.name);
            assert.equal(true, item.hasOwnProperty('data'));
            assert.equal(true, item.hasOwnProperty('expire'));
        });

        it('returns with 0 data if the cache doesn\'t exists', () => {
            assert.equal(0, app.throttle.getThrottleItem('throttle-tests.item-1').data);
        });

        it('increments by one for each call to the #can() method', () => {
            app.throttle.can('throttle-tests.can', 2, 3);
            assert.equal(1, app.throttle.getThrottleItem('throttle-tests.can').data);

            app.throttle.can('throttle-tests.can', 2, 3);
            assert.equal(2, app.throttle.getThrottleItem('throttle-tests.can').data);

            app.throttle.can('throttle-tests.can', 2, 3);
            assert.equal(3, app.throttle.getThrottleItem('throttle-tests.can').data);

            this.clock.tick(3500);

            app.throttle.can('throttle-tests.can', 2, 3);
            assert.equal(1, app.throttle.getThrottleItem('throttle-tests.can').data);
        });
    });

    describe('#getCacheAdapter()', () => {
        it('returns the memory cache adapter', () => {
            let cacheAdapter = app.throttle.getCacheAdapter();

            assert.equal('MemoryCache', cacheAdapter.constructor.name);
        });
    });
});
