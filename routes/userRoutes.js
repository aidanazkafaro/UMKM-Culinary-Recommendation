// userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// router.get('/', database.getTables);
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.get('/check_email', userController.check_email_exist);
router.get('/', (req, res) => {
  res.send('Hello World');
});

module.exports = router;
