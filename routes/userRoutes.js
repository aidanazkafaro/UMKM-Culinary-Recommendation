// userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const database = require('../database/database');

router.get('/', database.getTables);
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);

module.exports = router;
