
/**
 * Gets the application environment.
 *
 * @param  {String}  environment  The environment to parse, can be left out and
 *                                the config environment will be used instead.
 * @return {String}
 */
global.getEnvironment = function (environment = null) {
    if (environment === null) {
        environment = app.config.environment.toLowerCase();
    }

    switch (environment) {
        case 'prod':
        case 'production':
            return 'prod';

        case 'test':
        case 'testing':
            return 'test';

        default:
            return 'dev';
    }
};

/**
 * Checks if the current environment is set to production.
 *
 * @return {Boolean}
 */
global.isEnvironmentInProduction = function () {
    return getEnvironment() === 'prod';
};

/**
 * Checks if the current environment is set to testing.
 *
 * @return {Boolean}
 */
global.isEnvironmentInTesting = function () {
    return getEnvironment() === 'test';
};

/**
 * Checks if the current environment is set to development.
 *
 * @return {Boolean}
 */
global.isEnvironmentInDevelopment = function () {
    return getEnvironment() === 'dev';
};
