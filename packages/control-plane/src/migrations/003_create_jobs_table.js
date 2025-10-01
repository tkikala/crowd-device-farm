exports.up = function(knex) {
  return knex.schema.createTable('jobs', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('name').notNullable();
    table.text('description').nullable();
    table.string('status').defaultTo('pending'); // pending, running, completed, failed, cancelled
    table.string('platform').notNullable(); // android, ios, etc.
    table.string('test_type').notNullable(); // unit, integration, e2e, performance
    table.json('test_config').defaultTo('{}'); // test-specific configuration
    table.uuid('assigned_node_id').nullable().references('id').inTable('nodes');
    table.timestamp('started_at').nullable();
    table.timestamp('completed_at').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('jobs');
};

