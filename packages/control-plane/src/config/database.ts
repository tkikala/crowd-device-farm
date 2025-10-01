import knex from 'knex';
import config from '../config/config';

const dbConfig = {
  client: 'postgresql',
  connection: {
    host: config.database.host,
    port: config.database.port,
    database: config.database.name,
    user: config.database.user,
    password: config.database.password,
    ssl: config.database.ssl ? { rejectUnauthorized: false } : false
  },
  migrations: {
    directory: './src/migrations',
    tableName: 'knex_migrations'
  },
  seeds: {
    directory: './src/seeds'
  },
  pool: {
    min: 2,
    max: 10
  }
};

export default knex(dbConfig);

