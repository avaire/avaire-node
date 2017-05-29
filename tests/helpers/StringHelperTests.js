/** @ignore */
const assert = require('assert');
/** @ignore */
const sinon = require('sinon');
/** @ignore */
const sandbox = sinon.sandbox.create();

describe('app/helpers/StringHelpers', () => {
    beforeEach(() => {
        sandbox.stub(bot, 'User').get(() => {
            return {
                id: 'bot-id'
            };
        });
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('String #limit()', () => {
        it('doesn\'t cut off text that doesn\'t exceed the text limit', () => {
            let text = 'Lorem ipsum dolor sit amet';

            assert.equal(text, text.limit());
        });

        it('cuts text off that exceeds the text limit', () => {
            let text = 'Lorem ipsum dolor sit amet';

            assert.equal('Lorem ipsum...', text.limit(14));
        });

        it('chnages the suffix to the provided suffix', () => {
            let text = 'Lorem ipsum dolor sit amet';

            assert.equal('Lorem ipsum do', text.limit(14, ''));
            assert.equal('Lorem ips. . .', text.limit(14, '. . .'));
        });
    });

    describe('String #finish()', () => {
        it('doesn\'t add anything to the string if the string already ends with the given suffix', () => {
            let text = 'This is some sample text.';

            assert.equal(text, text.finish('.'));
        });

        it('cuts text off that exceeds the text limit', () => {
            let text = 'Lorem ipsum dolor sit amet';

            assert.equal('Lorem ipsum...', text.limit(14));
        });

        it('chnages the suffix to the provided suffix', () => {
            let text = 'Lorem ipsum dolor sit amet';

            assert.equal('Lorem ipsum do', text.limit(14, ''));
            assert.equal('Lorem ips. . .', text.limit(14, '. . .'));
        });
    });

    describe('String #hasBot()', () => {
        it('returns false if no one is tagged in the message', () => {
            assert.equal(false, 'Lorem ipsum dolor sit amet.'.hasBot());
        });

        it('returns false if someone is tagged in the message, but it isn\'t the bot', () => {
            assert.equal(false, 'Lorem ipsum dolor sit <@not-bot-id> amet.'.hasBot());
        });

        it('returns true if the bot is tagged in the message', () => {
            assert.equal(true, 'Lorem ipsum dolor sit <@bot-id> amet.'.hasBot());
        });

        it('returns true if the bot is tagged in the message via a nickname', () => {
            assert.equal(true, 'Lorem ipsum dolor sit <@!bot-id> amet.'.hasBot());
        });
    });

    describe('String #replaceBotWith()', () => {
        it('returns the same string if the bot isn\'t in the string', () => {
            let text = 'Lorem ipsum dolor sit amet.';

            assert.equal(text, text.replaceBotWith('Bot'));
        });

        it('returns the replaced version of the string if the bot is tagged', () => {
            let text = 'Lorem ipsum dolor <@bot-id>.';

            assert.equal('Lorem ipsum dolor Bot.', text.replaceBotWith('Bot'));
        });

        it('returns the replaced version of the string if the bot is tagged using a nickname', () => {
            let text = 'Lorem ipsum dolor <@!bot-id>.';

            assert.equal('Lorem ipsum dolor Bot.', text.replaceBotWith('Bot'));
        });
    });

    describe('String #firstToUpper()', () => {
        it('returns the same string if the string already ends with a capital letter', () => {
            let text = 'Hi there';

            assert.equal(text.firstToUpper(), text.firstToUpper());
        });

        it('returns a new string with the first character being capital', () => {
            assert.equal('Abcdefg', 'abcdefg'.firstToUpper());
        });

        it('doesn\'t change anything if all the ltters are capital', () => {
            assert.equal('HELLO WORLD', 'HELLO WORLD'.firstToUpper());
        });
    });
});
