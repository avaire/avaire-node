/** @ignore */
const TimeParser = requireApp('utils/time/TimeParser');
/** @ignore */
const assert = require('assert');

describe('app/utils/time/TimeParser', () => {
    describe('#parse()', () => {
        it('returns format, time array and seconds as an object', () => {
            let time = TimeParser.parse('2h2s');

            assert.equal(true, time.hasOwnProperty('format'));
            assert.equal(true, time.hasOwnProperty('timeArr'));
            assert.equal(true, time.hasOwnProperty('seconds'));
        });

        it('returns the correct format of the given string', () => {
            assert.equal('1 day, 3 hours, 28 minutes, and 42 seconds', TimeParser.parse('1d3h28m42s').format);
            assert.equal('2 hours, 58 minutes, and 2 seconds', TimeParser.parse('2h58m2s').format);
            assert.equal('31 minutes and 18 seconds', TimeParser.parse('31m18s').format);
            assert.equal('42 seconds', TimeParser.parse('42s').format);

            assert.equal('1 day, 28 minutes, and 42 seconds', TimeParser.parse('1d28m42s').format);
            assert.equal('2 hours and 2 seconds', TimeParser.parse('2h2s').format);
            assert.equal('31 days and 18 seconds', TimeParser.parse('31d18s').format);
            assert.equal('42 seconds and 4 days', TimeParser.parse('42s4d').format);
        });

        it('returns the correct amount of seconds', () => {
            assert.equal(98922, TimeParser.parse('1d3h28m42s').seconds);
            assert.equal(10682, TimeParser.parse('2h58m2s').seconds);
            assert.equal(1878, TimeParser.parse('31m18s').seconds);
            assert.equal(42, TimeParser.parse('42s').seconds);

            assert.equal(88122, TimeParser.parse('1d28m42s').seconds);
            assert.equal(7202, TimeParser.parse('2h2s').seconds);
            assert.equal(2678418, TimeParser.parse('31d18s').seconds);
            assert.equal(345642, TimeParser.parse('42s4d').seconds);
        });
    });
});
