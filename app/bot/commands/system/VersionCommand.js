/** @ignore */
let semverDiff = require('semver-diff');
/** @ignore */
const Command = require('./../Command');

class VersionCommand extends Command {
    constructor() {
        super('!', 'version', [], {
            description: 'Displays the current version of the bot and how many versions behind it is (if any)',
            middleware: [
                'throttle.channel:1,5'
            ]
        });
    }

    onCommand(sender, message, args) {
        let repositoryVersion = app.cache.get('github.version', app.version);
        let versionType = semverDiff(app.version, repositoryVersion);
        let versionMessage = [
            'I am currently `:difference` :type versions behind!',
            '',
            ':message',
            '',
            'You can get the latest version of me on github at [Senither/AvaIre](https://github.com/senither/AvaIre/)'
        ].join('\n');

        let placeholders;
        let embededElement = {
            title: 'v' + app.version,
            description: versionMessage,
            footer: {
                text: 'The latest version of AvaIre is v' + repositoryVersion
            }
        };

        // If the version differance is null we can assume we're using the lastest version.
        if (versionType === null) {
            embededElement.color = app.envoyer.colors.success;
            embededElement.description = 'You\'re using the latest version of AvaIre!';
            embededElement.footer = undefined;
        } else if (versionType === 'patch') {
            embededElement.color = app.envoyer.colors.info;
            placeholders = {
                difference: this.versionDiff(repositoryVersion, 2),
                type: versionType,
                message: 'Patch version updates are bug fixes, refractoring of existing code and very minor changes that ' +
                         'wont affect other things in the code base, it is recommended that you update on patch version ' +
                         'changes to keep up with the bug fixes and patches.'
            };
        } else if (versionType === 'minor') {
            embededElement.color = app.envoyer.colors.warn;
            placeholders = {
                difference: this.versionDiff(repositoryVersion, 1),
                type: versionType,
                message: 'Minor version updates are new addtions, features and reworks of the existing codebase, it is ' +
                         'recommended that you update on minor version changes to keep up with the new features.'
            };
        } else {
            embededElement.color = app.envoyer.colors.error;
            placeholders = {
                difference: this.versionDiff(repositoryVersion, 0),
                type: versionType,
                message: 'Major version updates are total reworks of the bot and how it works or a large compilation of ' +
                         'minor changes to the source code, it is highly recommended that you update on major version ' +
                         'changes since older versions will not be supported for bug fixes or updates.'
            };
        }

        return app.envoyer.sendEmbededMessage(message, embededElement, placeholders);
    }

    versionDiff(repoVersion, index) {
        return repoVersion.split('.')[index] - app.version.split('.')[index];
    }
}

module.exports = VersionCommand;
