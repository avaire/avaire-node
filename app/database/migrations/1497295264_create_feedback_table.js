
/**
 * Run the migrations, creating the feedback table.
 *
 * @param  {Knex} knex  The Knex database instance
 * @return {Promise}
 */
exports.up = function (knex, Promise) {
    return knex.schema.createTable(app.constants.FEEDBACK_TABLE_NAME, table => {
        table.increments();
        table.json('user');
        table.json('guild').nullable();
        table.json('channel');
        table.text('message', 2000);
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
    return knex.schema.dropTable(app.constants.FEEDBACK_TABLE_NAME);
};
