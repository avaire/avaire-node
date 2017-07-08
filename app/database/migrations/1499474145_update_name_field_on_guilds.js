
/**
 * Run the migrations, updating the name column on the guilds table.
 *
 * @param  {Knex} knex  The Knex database instance
 * @return {Promise}
 */
exports.up = function (knex, Promise) {
    return knex.schema.alterTable(app.constants.GUILD_TABLE_NAME, table => {
        table.text('name', 4080).collate('utf8mb4_unicode_ci').alter();
    });
};

/**
 * Reverse the migrations.
 *
 * @param  {Knex} knex  The Knex database instance
 * @return {Promise}
 */
exports.down = function (knex, Promise) {
    return knex.schema.alterTable(app.constants.GUILD_TABLE_NAME, table => {
        table.string('name').collate('utf8mb4_unicode_ci').alter();
    });
};
