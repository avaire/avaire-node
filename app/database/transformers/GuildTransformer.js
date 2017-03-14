/** @ignore */
const Transformer = require('./Transformer');

class GuildTransformer extends Transformer {
    prepare(data, _) {
        if (data.hasOwnProperty('settings') && !_.isObjectLike(data.settings)) {
            data.settings = JSON.parse(data.settings);
        }
        return data;
    }

    toDatabaseBindings() {
        return {
            name: this.data.name,
            local: this.data.local,
            settings: JSON.stringify(this.data.settings),
            updated_at: new Date
        };
    }

    defaults() {
        return {
            id: undefined,
            owner: undefined,
            name: undefined,
            local: undefined,
            settings: {}
        };
    }
}

module.exports = GuildTransformer;
