
/**
 * Run the migrations, creating the channels table.
 *
 * @param  {Knex} knex  The Knex database instance
 * @return {Promise}
 */
exports.up = function (knex, Promise) {
    return knex.schema.createTable(app.constants.CHANNEL_TABLE_NAME, function (table) {
        table.string('id').unique();
        table.string('guild_id');
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
    return knex.schema.dropTable(app.constants.CHANNEL_TABLE_NAME);
};
