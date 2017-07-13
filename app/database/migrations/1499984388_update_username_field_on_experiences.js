
/**
 * Run the migrations, updating the username column on the experiences table.
 *
 * @param  {Knex} knex  The Knex database instance
 * @return {Promise}
 */
exports.up = function (knex, Promise) {
    if (app.config.database.type.toLowerCase() !== 'mysql') {
        return Promise.resolve();
    }

    return knex.schema.alterTable(app.constants.USER_EXPERIENCE_TABLE_NAME, table => {
        table.text('username', 4080).collate('utf8mb4_unicode_ci').alter();
    });
};

/**
 * Reverse the migrations.
 *
 * @param  {Knex} knex  The Knex database instance
 * @return {Promise}
 */
exports.down = function (knex, Promise) {
    if (app.config.database.type.toLowerCase() !== 'mysql') {
        return Promise.resolve();
    }

    return knex.schema.alterTable(app.constants.USER_EXPERIENCE_TABLE_NAME, table => {
        table.string('username').collate('utf8mb4_unicode_ci').alter();
    });
};
