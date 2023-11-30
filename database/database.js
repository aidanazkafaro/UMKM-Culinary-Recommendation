const dotenv = require('dotenv');
// const mysql = require('mysql2');
const os = require('os');
dotenv.config();

// // local pool
// // const pool = mysql.createPool({
// //   host: 'localhost',
// //   user: 'root',
// //   database: 'capstoneDB',
// //   password: 'admin',
// //   waitForConnections: true,
// //   connectionLimit: 10,
// //   maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
// //   idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
// //   queueLimit: 0,
// //   enableKeepAlive: true,
// //   keepAliveInitialDelay: 0,
// // });

// console.log('process.env.DB_USER: ', process.env.DB_USER);
// console.log('process.env.DB_PASS: ', process.env.DB_PASS);
// console.log('process.env.DB_NAME: ', process.env.DB_NAME);
// console.log(
//   'process.env.INSTANCE_CONNECTION_NAME: ',
//   process.env.INSTANCE_CONNECTION_NAME
// );

// // pool to cloud sql
// const pool = mysql.createPool({
//   user: process.env.DB_USER,
//   password: process.env.DB_PASS,
//   database: process.env.DB_NAME,
//   socketPath: `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`,
// });

// module.exports = pool;

// from medium article
const mysql = require('mysql2');

// Database Connection for Production

// let config = {
//     user: process.env.SQL_USER,
//     database: process.env.SQL_DATABASE,
//     password: process.env.SQL_PASSWORD,
// }

// if (process.env.INSTANCE_CONNECTION_NAME && process.env.NODE_ENV === 'production') {
//   config.socketPath = `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`;
// }

// let connection = mysql.createConnection(config);
// console.log('process.env.INSTANCE_HOST: ', process.env.INSTANCE_HOST);
// console.log('process.env.DB_USER: ', process.env.DB_USER);
// console.log('process.env.DB_PASS: ', process.env.DB_PASS);
// console.log('process.env.DB_NAME: ', process.env.DB_NAME);

// Database Connection for Development
let connection = mysql.createConnection({
  host: process.env.INSTANCE_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
});

// Database connection for production
// let connection = mysql.createConnection({
//   host: os.environ.get('INSTANCE_HOST'),
//   user: os.environ.get('DB_USER'),
//   database: os.environ.get('DB_NAME'),
//   password: os.environ.get('DB_PASS'),
// });

connection.connect(function (err) {
  if (err) {
    console.error('Error connecting: ' + err.stack);
    return;
  }
  console.log('Connected as thread id: ' + connection.threadId);
});

module.exports = connection;
