
/**
 * Run the migrations, creating the statistics table.
 *
 * @param  {Knex} knex  The Knex database instance
 * @return {Promise}
 */
exports.up = function (knex, Promise) {
    return Promise.all([
        knex.schema.createTable(app.constants.STATISTICS_TABLE_NAME, table => {
            table.bigInteger('respects');
            table.timestamps();
        }).then(() => {
            return knex(app.constants.STATISTICS_TABLE_NAME).insert([
                {
                    respects: 0,
                    created_at: new Date,
                    updated_at: new Date
                }
            ]);
        })
    ]);
};

/**
 * Reverse the migrations.
 *
 * @param  {Knex} knex  The Knex database instance
 * @return {Promise}
 */
exports.down = function (knex, Promise) {
    return Promise.all([
        knex.schema.dropTableIfExists(app.constants.STATISTICS_TABLE_NAME)
    ]);
};
