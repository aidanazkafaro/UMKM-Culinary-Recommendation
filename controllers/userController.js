const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { getPool } = require('../database/database');
// let pool = getPool();
const database = require('../database/database');

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
    const emailExists = await database.check_email_exist(email);
    console.log('emailExists: ', emailExists);
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
          await database.insertUser(user);
          const token = jwt.sign(
            {
              email: user.email,
            },
            process.env.SECRET_KEY
          );
          res.status(200).json({
            message: 'User added to database, not verified',
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
  try {
    const userExists = await database.check_email_exist(email);
    console.log('userExists: ', userExists);
    //Verifying if the user exists in the database
    if (userExists.length === 0) {
      res.status(400).json({
        error: 'User is not registered, Sign Up first',
      });
    } else {
      bcrypt.compare(password, userExists[0].password, (err, result) => {
        //Comparing the hashed password
        if (err) {
          res.status(500).json({
            error: 'Server error',
          });
        } else if (result === true) {
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
              firstname: userExists[0]['firstname'],
              lastname: userExists[0]['lastname'],
              email: userExists[0]['email'],
              phonenumber: userExists[0]['phonenumber'],
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
};
