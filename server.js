// server.js
const express = require('express');
const app = express();
const userRoutes = require('./routes/userRoutes');
const mysql = require('mysql2');

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use('/auth', userRoutes); // Mount user routes
app.get('/', (req, res) => {
  res.send('Hello World');
});

const check_email_exist = async (email) => {
  try {
    const results = await pool.query(query, [email]);

    if (results.length === 0) {
      console.log('Email does not exist');
      return []; // Or handle accordingly
    } else {
      console.log('Email exists');
      return results; // Or handle accordingly
    }
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
