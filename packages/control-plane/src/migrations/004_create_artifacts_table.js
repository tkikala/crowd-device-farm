exports.up = function(knex) {
  return knex.schema.createTable('artifacts', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('job_id').references('id').inTable('jobs').onDelete('CASCADE');
    table.string('name').notNullable();
    table.string('type').notNullable(); // apk, test_apk, logs, screenshots, videos, reports
    table.string('file_path').notNullable();
    table.string('file_size').notNullable();
    table.string('mime_type').notNullable();
    table.string('checksum').notNullable(); // for integrity verification
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('artifacts');
};

