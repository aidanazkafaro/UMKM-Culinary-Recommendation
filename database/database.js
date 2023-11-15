const Knex = require('knex');
const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();

let pool;
// createTcpPool initializes a TCP connection pool for a Cloud SQL
// instance of Postgres.
const createTcpPool = async (config) => {
  // Note: Saving credentials in environment variables is convenient, but not
  // secure - consider a more secure solution such as
  // Cloud Secret Manager (https://cloud.google.com/secret-manager) to help
  // keep secrets safe.
  const dbConfig = {
    client: 'pg',
    connection: {
      host: process.env.INSTANCE_HOST, // e.g. '127.0.0.1'
      port: process.env.DB_PORT, // e.g. '5432'
      user: process.env.DB_USER, // e.g. 'my-user'
      password: process.env.DB_PASS, // e.g. 'my-user-password'
      database: process.env.DB_NAME, // e.g. 'my-database'
    },
    // ... Specify additional properties here.
    ...config,
  };
  // Establish a connection to the database.
  return Knex(dbConfig);
};

const createPool = async () => {
  const config = { pool: {} };

  config.pool.max = 5;
  config.pool.min = 5;
  config.pool.acquireTimeoutMillis = 60000; // 60 seconds
  config.pool.createTimeoutMillis = 30000; // 30 seconds
  config.pool.idleTimeoutMillis = 600000; // 10 minutes
  config.pool.createRetryIntervalMillis = 200; // 0.2 seconds

  return createTcpPool(config);
};

const ensureSchema = async (pool) => {
  const hasTable = await pool.schema.hasTable('users');
  console.log('hasTable users: ', hasTable);
};

const createPoolAndEnsureSchema = async () =>
  await createPool()
    .then(async (pool) => {
      await ensureSchema(pool);
      return pool;
    })
    .catch((err) => {
      //   logger.error(err);
      throw err;
    });

const InitializeDB = async () => {
  if (pool) {
    console.log('pool exists: ', pool);
    return;
  }
  try {
    pool = await createPoolAndEnsureSchema();
    console.log('users: ', (await pool('users').select('*')).length);
    return;
  } catch (err) {
    console.error(err);
    return;
  }
};

// Function to retrieve the pool
const getPool = async () => {
  try {
    pool = await createPoolAndEnsureSchema();
    console.log('users: ', (await pool('users').select('*')).length);
    return pool;
  } catch (err) {
    console.error(err);
    return;
  }
};

// Function to get tables
const getTables = async (req, res) => {
  try {
    const user = await pool('users').select('*');
    console.log(user);
    res.status(200).json({ user });
    return;
  } catch (err) {
    res.status(500).json({ error: err.message });
    return;
  }
};

const check_email_exist = async (email) => {
  try {
    const emailExists = await pool('users').select('*').where('email', email);
    // console.log('emailExists: ', emailExists);
    return emailExists;
  } catch (err) {
    throw Error(err);
  }
};

const insertUser = async (user) => {
  try {
    await pool('users').insert(user);
    return 'success insert user';
  } catch (err) {
    throw Error(err);
  }
};

module.exports = {
  createTcpPool,
  createPoolAndEnsureSchema,
  InitializeDB,
  getPool,
  getTables,
  check_email_exist,
  insertUser,
};
