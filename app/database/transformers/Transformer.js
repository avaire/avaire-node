/** @ignore */
const _ = require('lodash');

class Transformer {
    constructor(data) {
        data = this.prepare(data, _);

        let defaults = this.defaults();
        for (let index in defaults) {
            if (!data.hasOwnProperty(index)) {
                data[index] = defaults[index];
                continue;
            }

            if (_.isObjectLike(defaults[index])) {
                for (let subIndex in defaults[index]) {
                    if (!data[index].hasOwnProperty(subIndex)) {
                        data[index][subIndex] = defaults[index][subIndex];
                    }
                }
            }
        }

        this.data = data;
    }

    get(property) {
        if (typeof property === 'undefined') {
            return this.data;
        }

        let items = property.split('.');
        let data = this.all();
        for (let index in items) {
            let item = items[index];

            if (!data.hasOwnProperty(item)) {
                return undefined;
            }

            data = data[item];
        }

        return data;
    }

    all() {
        return this.data;
    }

    prepare(data, _) {
        return data;
    }

    defaults() {
        return {};
    }

    toDatabaseBindings() {
        return this.data;
    }
}

module.exports = Transformer;
