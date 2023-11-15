// server.js
const express = require('express');
const app = express();
const userRoutes = require('./routes/userRoutes');
const { InitializeDB } = require('./database/database');

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
InitializeDB();

app.use('/auth', userRoutes); // Mount user routes
app.get('/', (req, res) => {
  res.send('Hello World');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
