const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const connection = require('../database/database');
dotenv.config();

const check_email_exist = (email) => {
  return new Promise((resolve, reject) => {
    let query = 'SELECT * FROM users WHERE email = ?';

    connection.query(query, [email], (error, results) => {
      if (error) {
        console.log(error);
        reject('Database error');
      } else if (results.length === 0) {
        // console.log('Email does not exist');
        resolve([]);
      } else {
        // console.log('Email exists');
        resolve(results); // Changed to directly resolve the array
      }
    });
  });
};

const insert_user = (user) => {
  const { firstname, lastname, email, phonenumber, password } = user;

  let query = `INSERT INTO users (firstname, lastname, email, phonenumber, hashedPassword) VALUES (?,?,?,?,?)`;
  connection.query(
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

const registerUser = async (req, res) => {
  const { firstname, lastname, email, phonenumber, password } = req.body;
  const user = {
    firstname,
    lastname,
    email,
    phonenumber,
    password,
  };

  try {
    let emailExists = await check_email_exist(email);
    // console.log('emailExists: ', emailExists);
    if (emailExists.length !== 0) {
      return res.status(400).json({
        error: 'Email exists. No need to register again.',
      });
    } else {
      bcrypt.hash(password, 10, async (err, hash) => {
        if (err) {
          return res.status(500).json({
            error: 'Server error',
          });
        }
        user.password = hash;
        try {
          insert_user(user);
          const token = jwt.sign(
            {
              email: user.email,
            },
            process.env.SECRET_KEY
          );
          res.status(200).json({
            message: 'User added to database.',
            token: token,
          });
        } catch (err) {
          console.error(err);
          return res.status(500).json({
            error: 'Database error',
          });
        }
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: 'Database error occurred while registering user!',
    });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  // console.log('email: ', email);
  // console.log('password: ', password);
  try {
    let userExists = await check_email_exist(email);
    console.log('userExists: ', userExists);
    //Verifying if the user exists in the database
    if (userExists.length === 0) {
      res.status(401).json({
        error: 'User is not registered, Sign Up first',
      });
    } else {
      bcrypt.compare(password, userExists[0].hashedPassword, (err, result) => {
        //Comparing the hashed password
        if (result === true) {
          //Checking if credentials match
          const token = jwt.sign(
            {
              email: email,
            },
            process.env.SECRET_KEY
          );
          res.status(200).json({
            message: 'User signed in!',
            user: {
              firstname: userExists[0]['firstName'],
              lastname: userExists[0]['lastName'],
              email: userExists[0]['email'],
              phonenumber: userExists[0]['phoneNumber'],
            },
            token: token,
          });
        } else {
          //Declaring the errors
          if (result != true)
            res.status(400).json({
              error: 'Enter correct password!',
            });
        }
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: 'Database error occurred while signing in!', //Database connection error
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  check_email_exist,
};
