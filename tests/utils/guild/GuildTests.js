/** @ignore */
const Guild = requireApp('utils/guild/Guild');
/** @ignore */
const assert = require('assert');
/** @ignore */
const sinon = require('sinon');
/** @ignore */
const sandbox = sinon.sandbox.create();

describe('app/utils/guild/Guild', () => {
    beforeEach(() => {
        sandbox.spy(app.guild, 'getIdFrom');
        sandbox.spy(app.guild, 'getTypeOfObject');
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('#isFromSameGuild()', () => {
        it('calls the #getIdFrom() method twice, once for each context', () => {
            app.guild.isFromSameGuild('first-guild-context', 'second-guild-context');
            assert(app.guild.getIdFrom.calledTwice);
        });

        it('returns true if the two contexts given matches', () => {
            assert.equal(true, app.guild.isFromSameGuild('guild-id', 'guild-id'));
        });

        it('returns false if the two contexts given doesn\'t matches', () => {
            assert.equal(false, app.guild.isFromSameGuild('guild-id-1', 'guild-id-2'));
        });
    });

    describe('#getIdFrom()', () => {
        it('calls the #getTypeOfObject() method once to get the object type', () => {
            app.guild.getIdFrom('guild-id-context');
            assert(app.guild.getTypeOfObject.calledOnce);
        });

        it('returns null if an invalid type is given', () => {
            assert.equal(null, app.guild.getIdFrom(null));
            assert.equal(null, app.guild.getIdFrom(undefined));
            assert.equal(null, app.guild.getIdFrom(123));
            assert.equal(null, app.guild.getIdFrom({}));
            assert.equal(null, app.guild.getIdFrom([]));
        });

        it('returns the same string given to the method if a string is used', () => {
            assert.equal('guild-id-context', app.guild.getIdFrom('guild-id-context'));
        });

        it('returns the guild id for a IGuild context type', () => {
            let namespace = {
                IGuild: require(appRoot + 'node_modules/discordie/lib/interfaces/IGuild')
            };

            let mock = sinon.createStubInstance(namespace.IGuild);
            let stub = sinon.stub(mock, 'id');
            stub.get(() => 'guild-id');

            assert.equal('guild-id', app.guild.getIdFrom(mock));
        });

        it('returns the guild id for a IMessage context type', () => {
            let namespace = {
                IMessage: require(appRoot + 'node_modules/discordie/lib/interfaces/IMessage')
            };

            let mock = sinon.createStubInstance(namespace.IMessage);
            let stub = sinon.stub(mock, 'guild');
            stub.get(() => {
                return {
                    id: 'guild-id'
                };
            });

            assert.equal('guild-id', app.guild.getIdFrom(mock));
        });

        it('returns the guild id for a IChannel context type', () => {
            let namespace = {
                IChannel: require(appRoot + 'node_modules/discordie/lib/interfaces/IChannel')
            };

            let mock = sinon.createStubInstance(namespace.IChannel);
            let stub = sinon.stub(mock, 'guild_id');
            stub.get(() => 'guild-id');

            assert.equal('guild-id', app.guild.getIdFrom(mock));
        });

        it('returns the guild id for a ITextChannel context type', () => {
            let namespace = {
                ITextChannel: require(appRoot + 'node_modules/discordie/lib/interfaces/ITextChannel')
            };

            let mock = sinon.createStubInstance(namespace.ITextChannel);
            let stub = sinon.stub(mock, 'guild_id');
            stub.get(() => 'guild-id');

            assert.equal('guild-id', app.guild.getIdFrom(mock));
        });

        it('returns the guild id for a IVoiceChannel context type', () => {
            let namespace = {
                IVoiceChannel: require(appRoot + 'node_modules/discordie/lib/interfaces/IVoiceChannel')
            };

            let mock = sinon.createStubInstance(namespace.IVoiceChannel);
            let stub = sinon.stub(mock, 'guild_id');
            stub.get(() => 'guild-id');

            assert.equal('guild-id', app.guild.getIdFrom(mock));
        });

        it('returns the guild id for a IVoiceConnection context type', () => {
            let namespace = {
                IVoiceConnection: require(appRoot + 'node_modules/discordie/lib/interfaces/IVoiceConnection')
            };

            let mock = sinon.createStubInstance(namespace.IVoiceConnection);
            let stub = sinon.stub(mock, 'guild');
            stub.get(() => {
                return {
                    id: 'guild-id'
                }
            });

            assert.equal('guild-id', app.guild.getIdFrom(mock));
        });

        it('returns the guild id for a IGuildMember context type', () => {
            let namespace = {
                IGuildMember: require(appRoot + 'node_modules/discordie/lib/interfaces/IGuildMember')
            };

            let mock = sinon.createStubInstance(namespace.IGuildMember);
            let stub = sinon.stub(mock, 'guild_id');
            stub.get(() => 'guild-id');

            assert.equal('guild-id', app.guild.getIdFrom(mock));
        });

        it('returns the guild id for a VoiceSocket context type', () => {
            let namespace = {
                VoiceSocket: require(appRoot + 'node_modules/discordie/lib/networking/ws/VoiceSocket')
            };

            let mock = sinon.createStubInstance(namespace.VoiceSocket);
            let stub = sinon.stub(mock, 'guildId');
            stub.get(() => 'guild-id');

            assert.equal('guild-id', app.guild.getIdFrom(mock));
        });
    });
});
