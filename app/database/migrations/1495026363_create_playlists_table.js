
/**
 * Run the migrations, creating the guilds table.
 *
 * @param  {Knex} knex  The Knex database instance
 * @return {Promise}
 */
exports.up = function (knex, Promise) {
    return knex.schema.createTable(app.constants.PLAYLIST_TABLE_NAME, table => {
        table.increments();
        table.string('guild_id');
        table.string('name');
        table.integer('amount').default(0);
        table.json('songs');
        table.timestamps();

        table.collate('utf8_unicode_ci');
    });
};

/**
 * Reverse the migrations.
 *
 * @param  {Knex} knex  The Knex database instance
 * @return {Promise}
 */
exports.down = function (knex, Promise) {
    return knex.schema.dropTable(app.constants.PLAYLIST_TABLE_NAME);
};
