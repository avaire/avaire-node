/** @ignore */
const assert = require('assert');
/** @ignore */
const sinon = require('sinon');
/** @ignore */
const sandbox = sinon.sandbox.create();

describe('app/helpers/FunctionHelpers', () => {
    afterEach(() => {
        sandbox.restore();
    });

    describe('#getEnvironment()', () => {
        it('returns "test" if the environment is set to test ', () => {
            sandbox.stub(app, 'config').get(() => {
                return {environment: 'test'};
            });

            assert.equal('test', getEnvironment());
        });

        it('returns "test" if the environment is set to testing ', () => {
            sandbox.stub(app, 'config').get(() => {
                return {environment: 'testing'};
            });

            assert.equal('test', getEnvironment());
        });

        it('returns "prod" if the environment is set to prod ', () => {
            sandbox.stub(app, 'config').get(() => {
                return {environment: 'prod'};
            });

            assert.equal('prod', getEnvironment());
        });

        it('returns "prod" if the environment is set to production ', () => {
            sandbox.stub(app, 'config').get(() => {
                return {environment: 'production'};
            });

            assert.equal('prod', getEnvironment());
        });

        it('returns "dev" if the environment is set to dev ', () => {
            sandbox.stub(app, 'config').get(() => {
                return {environment: 'dev'};
            });

            assert.equal('dev', getEnvironment());
        });

        it('returns "dev" if the environment is set to a non-compatible environment', () => {
            sandbox.stub(app, 'config').get(() => {
                return {environment: 'Lorem ipsum'};
            });

            assert.equal('dev', getEnvironment());
        });

        it('returns the environment key for the given environment parsed as an argument', () => {
            assert.equal('prod', getEnvironment('prod'));
            assert.equal('prod', getEnvironment('production'));

            assert.equal('test', getEnvironment('test'));
            assert.equal('test', getEnvironment('testing'));

            assert.equal('dev', getEnvironment('dev'));
            assert.equal('dev', getEnvironment('development'));
            assert.equal('dev', getEnvironment('random-environment'));
        });
    });

    describe('#isEnvironmentInProduction()', () => {
        it('returns true if the environment is in production, false otherwise', () => {
            sandbox.stub(app, 'config').get(() => {
                return {environment: 'prod'};
            });

            assert.equal(true, isEnvironmentInProduction());
            assert.equal(false, isEnvironmentInTesting());
            assert.equal(false, isEnvironmentInDevelopment());
        });

        it('returns true if the environment is in testings, false otherwise', () => {
            sandbox.stub(app, 'config').get(() => {
                return {environment: 'test'};
            });

            assert.equal(false, isEnvironmentInProduction());
            assert.equal(true, isEnvironmentInTesting());
            assert.equal(false, isEnvironmentInDevelopment());
        });

        it('returns true if the environment is in development, false otherwise', () => {
            sandbox.stub(app, 'config').get(() => {
                return {environment: 'dev'};
            });

            assert.equal(false, isEnvironmentInProduction());
            assert.equal(false, isEnvironmentInTesting());
            assert.equal(true, isEnvironmentInDevelopment());
        });
    });
});
