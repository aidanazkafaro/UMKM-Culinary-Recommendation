// server.js
const express = require('express');
const app = express();
const userRoutes = require('./routes/userRoutes');

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.use('/auth', userRoutes); // Mount user routes
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
