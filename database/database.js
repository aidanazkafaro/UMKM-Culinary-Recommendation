const dotenv = require('dotenv');
const mysql = require('mysql2');

dotenv.config();

// Create the connection pool. The pool-specific settings are the defaults
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  database: 'capstoneDB',
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
  idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

// Promise connection
// const connectionPromise = pool.promise();

// const mysqlConnection = mysql.createConnection({
//   host: '127.0.0.1',
//   user: 'root',
//   password: 'admin',
//   database: 'capstoneDB',
//   multipleStatements: true,
// });

// const query = 'SELECT * FROM capstoneDB.users';

// conne.connect((err) => {
//   if (!err) {
//     console.log('Connected to MySQL DB');
//   } else {
//     console.log('Connection to MySQL DB Failed');
//   }
// });

// const check_email_exist = async (email) => {
//   let query = 'SELECT * FROM capstoneDB.users WHERE email = ?';

//   try {
//     const results = await pool.query(query, [email]);

//     if (results.length === 0) {
//       console.log('Email does not exist');
//       return []; // Or handle accordingly
//     } else {
//       console.log('Email exists');
//       return results; // Or handle accordingly
//     }
//   } catch (err) {
//     console.error(err);
//     throw err;
//   }
// };

async function check_email_exist() {
  const query = 'SELECT * FROM capstoneDB.users WHERE email = ?';
  const [rows, fields] = await pool.conn;
}

let ret = check_email_exist('aidan@gmail.com');
console.log('ret', ret);
const insert_user = (user) => {
  const { firstname, lastname, email, phonenumber, password } = user;

  let query = `INSERT INTO capstoneDB.users (firstname, lastname, email, phonenumber, password) VALUES (?,?,?,?,?)`;
  pool.query(
    query,
    [firstname, lastname, email, phonenumber, password],
    (err, results) => {
      if (err) {
        console.error(err);
      } else {
        console.log(results);
        return results;
      }
    }
  );
};

module.exports = {
  check_email_exist,
  insert_user,
};
