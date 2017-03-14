
/**
 * Run the migrations, creating the guilds table.
 *
 * @param  {Knex} knex  The Knex database instance
 * @return {Promise}
 */
exports.up = function (knex, Promise) {
    return knex.schema.createTable(app.constants.GUILD_TABLE_NAME, function (table) {
        table.string('id').unique();
        table.string('owner');
        table.string('name');
        table.string('local').nullable();
        table.json('settings');
        table.timestamps();
    });
};

/**
 * Reverse the migrations.
 *
 * @param  {Knex} knex  The Knex database instance
 * @return {Promise}
 */
exports.down = function (knex, Promise) {
    return knex.schema.dropTable(app.constants.GUILD_TABLE_NAME);
};
