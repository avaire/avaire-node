/** @ignore */
var semverDiff = require('semver-diff');
/** @ignore */
const Command = require('./../Command');

class VersionCommand extends Command {
    constructor() {
        super('!', 'version', [], {
            middleware: [
                'throttle.channel:1,5'
            ]
        });
    }

    onCommand(sender, message, args) {
        let repositoryVersion = app.cache.get('github.version', app.version);
        let versionType = semverDiff(app.version, repositoryVersion);
        let versionMessage = [
            'You are currently `:difference` :type versions behind!',
            '',
            ':message',
            '',
            'You can get the latest version from github:',
            'https://github.com/senither/AvaIre/'
        ].join('\n');

        // If the version differance is null we can assume we're using the lastest version.
        if (versionType === null) {
            return app.envoyer.sendSuccess(message, 'You\'re using the latest version of AvaIre!');
        }

        if (versionType === 'patch') {
            return app.envoyer.sendInfo(message, versionMessage, {
                difference: this.versionDiff(repositoryVersion, 2),
                type: versionType,
                message: 'Patch version updates are bug fixes, refractoring of existing code and very minor changes that ' +
                         'wont affect other things in the code base, it is recommended that you update on patch version ' +
                         'changes to keep up with the bug fixes and patches.'
            });
        }

        if (versionType === 'minor') {
            return app.envoyer.sendWarn(message, versionMessage, {
                difference: this.versionDiff(repositoryVersion, 1),
                type: versionType,
                message: 'Minor version updates are new addtions, features and reworks of the existing codebase, it is ' +
                         'recommended that you update on minor version changes to keep up with the new features.'
            });
        }

        return app.envoyer.sendError(message, versionMessage, {
            difference: this.versionDiff(repositoryVersion, 0),
            type: versionType,
            message: 'Major version updates are total reworks of the bot and how it works or a large compilation of ' +
                     'minor changes to the source code, it is highly recommended that you update on major version ' +
                     'changes since older versions will not be supported for bug fixes or updates.'
        });
    }

    versionDiff(repoVersion, index) {
        return repoVersion.split('.')[index] - app.version.split('.')[index];
    }
}

module.exports = VersionCommand;
